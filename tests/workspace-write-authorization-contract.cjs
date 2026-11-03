// Source-contract regression for collaboration workspace write-path authorization.
// Run: node tests/workspace-write-authorization-contract.cjs
// Source checks do not replace authenticated browser or database RLS tests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'workspace.html'), 'utf8');
const start = html.indexOf('async function requireCurrentCollaborationAccess()');
const end = html.indexOf('async function loadOverview()', start);
assert(start >= 0 && end > start, 'shared authorization guard exists');
const guard = html.slice(start, end);
assert(guard.includes('sb.auth.getUser()'), 'guard checks fresh session');
assert(guard.includes('auth.data.user.id!==user.id'), 'guard rejects account switch');
assert(guard.includes('access.data.status!=="accepted"'), 'guard rejects revoked collaboration');
assert(guard.includes('access.data.sender_id,access.data.recipient_id'), 'guard checks participants');
const callCount = (html.match(/await requireCurrentCollaborationAccess\(\)/g) || []).length;
assert.equal(callCount, 6, 'six write handlers recheck access');
const taskWrites = [...html.matchAll(/sb\.from\("shane_collaboration_tasks"\)\.(insert|update|delete)\(/g)];
assert.equal(taskWrites.length, 4, 'four task mutation expressions');
for (const write of taskWrites) {
  const before = html.slice(Math.max(0, write.index - 220), write.index);
  assert(before.includes('await requireCurrentCollaborationAccess()'), 'task mutation rechecks access');
}
assert(html.includes('try{await requireCurrentCollaborationAccess();const purpose='), 'shared direction rechecks access');
assert(html.includes('try{await requireCurrentCollaborationAccess();const {error}=await sb.from("shane_collaboration_messages").insert'), 'message insert rechecks access');
assert(html.includes('if(body.length>4000)'), 'message body enforces 4000-character limit');
console.log('Workspace authorization source-contract assertions passed (not live RLS or browser tests).');
