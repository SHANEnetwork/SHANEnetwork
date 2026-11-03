const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('builder.html','utf8');
const begin='let privateSiteSaveInFlight=false;document.getElementById("saveSite").onclick=';
const end='document.getElementById("newBlankSite").onclick=';
const start=html.indexOf(begin),finish=html.indexOf(end,start);
assert(start>=0&&finish>start,'save handler anchors');
const source=html.slice(start,finish);
async function test(){
 let release, inserts=0, links=0,refreshes=0;
 const gate=new Promise(resolve=>{release=resolve});
 const status={textContent:''};
 const fields={status,saveSite:{},savedSites:{value:''}};
 const document={getElementById(id){return fields[id]||null},dispatchEvent(){}};
 const sb={auth:{getUser:async()=>({data:{user:{id:'owner-a'}},error:null})},from(table){
   if(table==='shane_sites')return {insert(){inserts++;return {select(){return {single:async()=>{await gate;return {data:{id:'site-a'},error:null}}}}}}};
   if(table==='shane_endeavors')return {update(){links++;return {eq(){return this},select(){return {maybeSingle:async()=>({data:{id:'endeavor-a'},error:null})}}}}};
   throw Error('unexpected table '+table);
 }};
 const ctx={document,sb,activeEndeavorId:'endeavor-a',selectedSiteId:null,
   getSite:()=>({name:'Example',about:'Something substantial'}),
   updateWorkspacePublicLink(){},updateWorkspace(){},updateUnsavedState(){},
   refreshSites(){refreshes++},CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts.detail}},
   confirm:()=>true,Date,JSON};
 vm.createContext(ctx);
 vm.runInContext(source,ctx,{timeout:1000});
 const first=fields.saveSite.onclick();
 const second=fields.saveSite.onclick();
 await Promise.resolve();await Promise.resolve();
 assert.equal(inserts,1,'only one database insert while pending');
 release();await Promise.all([first,second]);
 assert.equal(inserts,1);assert.equal(links,1);
 await fields.saveSite.onclick();
 assert.equal(inserts,2,'subsequent save is permitted after completion');
 console.log('Private site save concurrency regression passed: one in-flight insert, one link, retry unlocked.');
}
test().catch(e=>{console.error(e);process.exitCode=1});
