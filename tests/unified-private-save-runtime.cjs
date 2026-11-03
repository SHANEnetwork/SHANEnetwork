const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('shane-unified-private-save.js','utf8');
function scenario({name='Example',about='A complete description',pages='',services='',selected='',disabled=false}={}){
 const handlers=new Map();let clicks=0;
 const elements={
  business:{value:name},about:{value:about},pages:{value:pages},services:{value:services},
  savedSites:{value:selected},saveSite:{disabled,click(){clicks++}},shaneIdeaMessage:{textContent:''}
 };
 const document={addEventListener(type,handler){handlers.set(type,handler)},getElementById(id){return elements[id]||null}};
 vm.runInNewContext(source,{document},{timeout:1000});
 assert.equal(typeof handlers.get('shane:endeavor-account-saved'),'function');
 handlers.get('shane:endeavor-account-saved')({detail:{id:'example-endeavor'}});
 return {clicks,message:elements.shaneIdeaMessage.textContent};
}
assert.equal(scenario().clicks,1,'new substantial draft triggers one private save');
assert.equal(scenario({selected:'existing-site'}).clicks,0,'existing site must not be overwritten');
assert.equal(scenario({name:''}).clicks,0,'unnamed draft must not save');
assert.equal(scenario({about:'',pages:'',services:''}).clicks,0,'empty draft must not save');
assert.equal(scenario({disabled:true}).clicks,0,'disabled save must not trigger');
assert.match(scenario({selected:'existing-site'}).message,/not overwritten/i);
console.log('Six unified-save runtime assertions passed (mock DOM; not browser/database).');
