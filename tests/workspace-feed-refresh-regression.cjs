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
  if(name==='activity'){
    assert(loader.includes('host.setAttribute("aria-busy","true")'), 'Activity marks refresh as busy');
    assert(loader.includes('host.setAttribute("aria-busy","false")'), 'Activity clears busy state');
    assert(loader.indexOf('if(msgs.error||activity.error)') < loader.indexOf('host.replaceChildren()'), 'Failed activity refresh preserves existing events');
    assert(source.includes('id="activityStatus"'), 'Activity error has a separate status element');
  }
  if(name==='messages'){
    assert(loader.includes('host.setAttribute("aria-busy","true")'), 'Conversation marks refresh as busy');
    assert(loader.includes('host.setAttribute("aria-busy","false")'), 'Conversation clears busy state');
    assert(loader.indexOf('if(error)') < loader.indexOf('host.replaceChildren()'), 'Failed refresh retains existing messages');
  }
  console.log('PASS ' + name + ' refresh ordering guards');
}
