// Run with: node --test tests/shane-endeavor-context-regression.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const context = require('../shane-endeavor-context.js');

const saved = () => ({
  id: 'endeavor-123', persisted: true, title: 'Research Network',
  vision: 'Build an international research community',
  linkedSiteId: 'site-1', linkedOrganizationId: 'org-1',
  spec: { pages: ['Home', 'Projects'] },
  conversation: [{ role: 'user', text: 'Include collaboration spaces' }]
});

test('rejects unsaved endeavors and unknown specialist roles', () => {
  assert.throws(() => context.build({ ...saved(), persisted: false }), /saved endeavor/i);
  assert.throws(() => context.build(saved(), 'unknown'), /unknown role/i);
});

test('passes identity, composition, and history to the analyst without execution authority', () => {
  const creator = context.build(saved());
  const analyst = context.handoff(creator, 'analyst', 'Check financial assumptions');
  assert.equal(analyst.endeavorId, creator.endeavorId);
  assert.deepEqual(analyst.conversation, creator.conversation);
  assert.deepEqual(analyst.composition, creator.composition);
  assert.equal(analyst.linkedSiteId, 'site-1');
  assert.equal(analyst.linkedOrganizationId, 'org-1');
  assert.equal(analyst.advisoryOnly, true);
  assert.equal(analyst.legalExecutionAuthorized, false);
  assert.equal(analyst.role, 'analyst');
  assert.equal(creator.role, 'creator');
});

test('rejects invalid handoffs and never escalates authority', () => {
  assert.throws(() => context.handoff({}, 'analyst'), /invalid context/i);
  assert.throws(() => context.handoff(context.build(saved()), 'superuser'), /unknown role/i);
  const result = context.handoff({ ...context.build(saved()), advisoryOnly: false, legalExecutionAuthorized: true }, 'legal');
  assert.equal(result.advisoryOnly, true);
  assert.equal(result.legalExecutionAuthorized, false);
});

test('loads only through supplied authenticated store', async () => {
  await assert.rejects(() => context.load({}, 'endeavor-123', {}), /authenticated endeavor store/i);
  let requested;
  const store = { load: async (client, id) => { requested = { client, id }; return saved(); } };
  const client = { signedIn: true };
  const result = await context.load(client, 'endeavor-123', store, 'professional', 'Historian');
  assert.deepEqual(requested, { client, id: 'endeavor-123' });
  assert.equal(result.specialty, 'Historian');
  assert.equal(result.role, 'professional');
});

test('bounds user-provided text in specialist context', () => {
  const item = saved();
  item.title = 'x'.repeat(300);
  item.conversation = [{ role: 'user', text: 'a'.repeat(7000) }];
  const result = context.build(item);
  assert.equal(result.title.length, 150);
  assert.equal(result.conversation[0].text.length, 6000);
});

test('snapshots and freezes nested composition across handoffs', () => {
  const original = saved();
  const creator = context.build(original);
  original.spec.pages.push('Secret');
  original.conversation[0].text = 'Changed later';
  assert.deepEqual(creator.composition.pages, ['Home', 'Projects']);
  assert.equal(creator.conversation[0].text, 'Include collaboration spaces');
  assert.equal(Object.isFrozen(creator.composition), true);
  assert.equal(Object.isFrozen(creator.composition.pages), true);
  const analyst = context.handoff(creator, 'analyst');
  assert.equal(Object.isFrozen(analyst.conversation), true);
  assert.equal(Object.isFrozen(analyst.conversation[0]), true);
});

test('rejects circular and excessively nested endeavor specifications', () => {
 const circular = {}; circular.self = circular;
 assert.throws(() => context.build({...saved(),spec:circular}),/circular endeavor context/i);
 let deep = {}; for(let i=0;i<30;i++)deep={next:deep};
 assert.throws(() => context.build({...saved(),spec:deep}),/nesting limit/i);
});

test('removes unsafe keys from composition snapshots', () => {
 const spec=JSON.parse('{"safe":true,"__proto__":{"polluted":true},"constructor":{"x":1}}');
 const result=context.build({...saved(),spec});
 assert.equal(result.composition.safe,true);
 assert.equal(Object.hasOwn(result.composition,'__proto__'),false);
 assert.equal(Object.hasOwn(result.composition,'constructor'),false);
});

test('preserves read-only collaborator permissions through specialist handoffs', () => {
 const shared={...saved(),accessRole:'collaborator',canEdit:false};
 const creator=context.build(shared);
 assert.equal(creator.accessRole,'collaborator');
 assert.equal(creator.canEdit,false);
 for(const role of ['analyst','professional','legal','gamemaster']){
   const handoff=context.handoff(creator,role,'Review the shared endeavor');
   assert.equal(handoff.accessRole,'collaborator');
   assert.equal(handoff.canEdit,false);
   assert.equal(handoff.advisoryOnly,true);
 }
});
