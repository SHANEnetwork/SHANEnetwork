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
assert(loader.includes('Shared direction is being saved. Refresh after saving finishes.'), 'Refresh is blocked during an active direction save');
assert(loader.includes('||$("overviewForm").querySelector(\'button[type="submit"]\')?.disabled)return;'), 'Late refresh responses are ignored during saves');

const saveStart = source.indexOf('$("overviewForm").onsubmit=async e=>');
const saveEnd = source.indexOf('let activityLoadGeneration=0;', saveStart);
assert(saveStart >= 0 && saveEnd > saveStart, 'Shared direction save handler exists');
const save = source.slice(saveStart, saveEnd);
assert(save.includes('const stamp=new Date().toISOString();overviewLoadGeneration++;let result;'), 'Starting a save invalidates in-flight direction refreshes');
assert(save.includes('overviewVersion=result.data.updated_at;overviewLoadGeneration++;'), 'Successful save invalidates pending refreshes');
assert(save.indexOf('const stamp=new Date().toISOString();overviewLoadGeneration++;') < save.indexOf('let result;'), 'Pending refresh is invalidated before save request');
assert(save.indexOf('overviewVersion=result.data.updated_at;overviewLoadGeneration++;') > save.indexOf('if(!result.data)'), 'Successful save invalidates later refreshes after confirmation');
assert(save.includes('purposeDraft=purposeField.value,nextDraft=nextField.value'), 'Save snapshots original editor text');
assert(save.includes('purposeField.value!==purposeDraft||nextField.value!==nextDraft'), 'Detect newer edits during save');
assert(save.includes('Your newer edits remain here'), 'Explain newer edits still need saving');
assert(save.includes('e.target.querySelector(\'button[type="submit"]\')?.disabled'), 'Ignore repeat shared-direction submissions while saving');
console.log('PASS shared direction refresh preserves in-flight edits');
