const {test}=require('node:test');
const assert=require('node:assert/strict');
const {inspect}=require('../shane-endeavor-guard.cjs');
const good={id:'E1',ownerId:'U1',originalVision:'Build a community',components:[{id:'S1',endeavorId:'E1',ownerId:'U1'}],history:[{id:'R1',endeavorId:'E1'}],collaborations:[{endeavorId:'E1',status:'accepted',acceptedBy:'U2'}]};
test('quick mode protects identity, vision, ownership and components without deep traversal',()=>{
 const result=inspect(good);assert.equal(result.findings.length,0);assert.equal(result.level,'quick');assert.equal(result.releaseApproved,false);
});
test('quick mode identifies cross-endeavor and ownership contamination',()=>{
 const r=inspect({...good,components:[{id:'A',endeavorId:'E2',ownerId:'U2'},{id:'A'}]});
 for(const code of ['foreign-endeavor-component','foreign-owner-component','duplicate-component-id'])assert.ok(r.findings.some(f=>f.code===code),code);
});
test('deep mode inspects history and accepted collaboration evidence',()=>{
 const r=inspect({...good,history:[{id:'R1',endeavorId:'E2'},{id:'R1'}],collaborations:[{endeavorId:'E2',status:'accepted'}]},{level:'deep'});
 for(const code of ['foreign-history-entry','invalid-history-id','foreign-collaboration','unverified-collaboration-acceptance'])assert.ok(r.findings.some(f=>f.code===code),code);
 assert.equal(r.security.changesApplied,false);
});
test('deep and quick results remain deterministic and never approve releases',()=>{
 assert.deepEqual(inspect(good,{level:'deep'}),inspect(good,{level:'deep'}));
 assert.throws(()=>inspect(good,{level:'unknown'}));
 assert.equal(inspect(good,{level:'deep'}).releaseApproved,false);
});
