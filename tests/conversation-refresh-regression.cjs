const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'members.html'), 'utf8');
const start = source.indexOf('async function openConversation(requestId,item)');
const end = source.indexOf('async function requestCollaboration(listing)', start);
assert(start >= 0 && end > start, 'Conversation implementation must exist');
const conversation = source.slice(start, end);
const cases = [
  ['newest messages fetched first', conversation.includes('.order("created_at",{ascending:false}).limit(100)')],
  ['messages displayed chronologically', conversation.includes('[...(data||[])].reverse()')],
  ['refresh generation advances per request', conversation.includes('const generation=++refreshGeneration')],
  ['stale results ignored before rendering', conversation.includes('if(generation!==refreshGeneration||!panel.isConnected)return')],
  ['closed panels cannot be updated', conversation.includes('!panel.isConnected')],
  ['history replaced after latest-response checks', conversation.indexOf('history.replaceChildren()') > conversation.indexOf('const generation=++refreshGeneration')],
];
for (const [name, passed] of cases) console.log((passed ? 'PASS ' : 'FAIL ') + name);
assert(cases.every(([, passed]) => passed), 'Conversation refresh regression');
