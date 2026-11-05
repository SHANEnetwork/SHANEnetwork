// Static local navigation/resource audit. Dynamic URLs are reported separately.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const files=new Set();
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','.next','dist','coverage'].includes(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else files.add(path.relative(root,full).replace(/\\/g,'/'));}}
walk(root);
const html=[...files].filter(x=>x.endsWith('.html'));
const errors=[],skipped=[],checked=[];
for(const file of html){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 for(const match of source.matchAll(/\b(href|src)\s*=\s*(["'])(.*?)\2/gi)){
  const value=match[3].trim();
  if(!value||value.startsWith('#')||/^(?:https?:|mailto:|tel:|data:|blob:|javascript:|\/\/)/i.test(value))continue;
  if(/[<>{}$]/.test(value)||/\b(?:encodeURIComponent|location\.)\b/.test(value)){skipped.push({file,value,reason:'dynamic'});continue;}
  let target;
  try{target=decodeURIComponent(value.split(/[?#]/)[0]);}catch{errors.push({file,value,reason:'invalid URI encoding'});continue;}
  if(!target)continue;
  if(target.startsWith('/'))target=target.slice(1);
  else target=path.posix.normalize(path.posix.join(path.posix.dirname(file),target));
  if(target.endsWith('/'))target+='index.html';
  if(target.startsWith('../')){errors.push({file,value,reason:'escapes repository'});continue;}
  const valid=files.has(target);
  (valid?checked:errors).push({file,value,target,...(!valid?{reason:'missing file'}:{})});
 }
}
console.log('SHANE internal link audit: '+html.length+' HTML files, '+checked.length+' existing local targets, '+errors.length+' missing/invalid targets, '+skipped.length+' dynamic targets excluded');
for(const e of errors)console.error('FAIL '+e.file+' '+e.value+' -> '+e.target+' ('+e.reason+')');
if(skipped.length)console.log('Dynamic targets require browser/route verification: '+JSON.stringify(skipped.slice(0,30)));
if(errors.length)process.exitCode=1;
