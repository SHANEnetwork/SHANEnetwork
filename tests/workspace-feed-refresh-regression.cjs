const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'workspace.html'), 'utf8');
for (const [name, marker, next, guard] of [
  ['activity', 'async function loadActivity()', '$("refreshActivity").onclick=loadActivity;', 'activityLoadGeneration'],
  ['messages', 'async function messages()', 'async function init()', 'messageLoadGeneration'],
]) {
  const start = source.indexOf(marker), end = source.indexOf(next, start);
  assert(start >= 0 && end > start, name + ' loader exists');
  const loader = source.slice(start, end);
  assert(source.includes('let ' + guard + '=0;'), name + ' counter initialized');
  assert(loader.includes('const generation=++' + guard), name + ' generation advanced');
  const check = 'if(generation!==' + guard + '||!host.isConnected)return;';
  assert(loader.includes(check), name + ' stale response guard');
  assert(loader.indexOf(check) < loader.indexOf('host.replaceChildren()'), name + ' guard before render');
  console.log('PASS ' + name + ' refresh ordering guards');
}
