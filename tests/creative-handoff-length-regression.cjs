const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('shane-creative-handoff.js', 'utf8');
assert.match(source, /slice\(0,10000\)/, 'handoff must preserve the draft creator maximum of 10000 characters');
console.log('Creative handoff length is aligned');
