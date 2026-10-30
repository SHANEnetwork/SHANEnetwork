const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'workspace.html'), 'utf8');
const start = source.indexOf('async function loadOverview()');
const end = source.indexOf('$("refreshOverview").onclick=loadOverview;', start);
assert(start >= 0 && end > start, 'Shared direction loader exists');
const loader = source.slice(start, end);
for (const [name, needle] of [
  ['generation counter', 'const generation=++overviewLoadGeneration'],
  ['stale response guard', 'generation!==overviewLoadGeneration'],
  ['local edits comparison', 'purposeField.value!==previousPurpose||nextField.value!==previousNext'],
  ['preserve editing notice', 'Your unsaved text was preserved'],
  ['version update', 'overviewVersion=data?.updated_at||null'],
]) assert(loader.includes(needle), name);
assert(loader.indexOf('purposeField.value!==previousPurpose') < loader.indexOf('purposeField.value=data?.purpose'), 'Check edits before replacing fields');
console.log('PASS shared direction refresh preserves in-flight edits');
