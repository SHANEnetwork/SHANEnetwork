const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const handoffScript = fs.readFileSync('shane-creative-handoff.js', 'utf8');
const entryScript = fs.readFileSync('shane-vision-entry.js', 'utf8');
const KEY = 'shane-creative-handoff-v1';
function scenario({text, existing='', disabled=false, order=['handoff','entry'], created=Date.now()}) {
  const values = new Map([[KEY, JSON.stringify({text, created})]]);
  const store = {getItem:k=>values.get(k)||null, setItem:(k,v)=>values.set(k,v), removeItem:k=>values.delete(k)};
  let clicks=0;
  const vision={value:existing, dispatchEvent(){}, closest(){return null}};
  const reply={value:''};
  const button={disabled, click(){clicks++}};
  const status={textContent:''};
  const elements={visionPrompt:vision,shaneIdeaReply:reply,shaneBuildVisionNow:button,visionStatus:status};
  const document={readyState:'complete',getElementById:id=>elements[id]||null,createElement:()=>({setAttribute(){},addEventListener(){},append(){}})};
  const context={document,sessionStorage:store,window:{SHANEConversation:{remember(){}}},Event:class Event{},Date};
  vm.createContext(context);
  for(const part of order)vm.runInContext(part==='handoff'?handoffScript:entryScript,context);
  return {clicks,vision:vision.value,handoff:store.getItem(KEY),status:status.textContent};
}
const long='An original endeavor with details: '+'x'.repeat(4200);
for(const order of [['handoff','entry'],['entry','handoff']]){
  const r=scenario({text:long,order});
  assert.equal(r.clicks,1,'one private draft invocation regardless of script order');
  assert.equal(r.vision,long,'full vision retained without truncation');
  assert.equal(r.handoff,null,'successful invocation consumes the handoff');
}
const editing=scenario({text:'New idea',existing:'Existing unsaved work'});
assert.equal(editing.clicks,0);
assert.equal(editing.vision,'Existing unsaved work');
assert.ok(editing.handoff,'do not discard a different pending idea');
const busy=scenario({text:'Ready to create',disabled:true});
assert.equal(busy.clicks,0);
assert.ok(busy.handoff,'disabled creator must preserve handoff');
const expired=scenario({text:'Old idea',created:Date.now()-2*3600000});
assert.equal(expired.clicks,0,'expired handoff must not auto-create');
console.log('Creative entry handoff integration scenarios passed');
