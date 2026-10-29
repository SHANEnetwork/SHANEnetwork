const assert=require("node:assert/strict");const engine=require("../shane-composition.js");const {provision}=require("../shane-provision.js");
const spec=engine.compose({endeavorId:"unsaved-draft",title:"Community Garden",modules:["memberships","events"]});
let inserted;const client={auth:{getUser:async()=>({data:{user:{id:"owner-1"}}})},from(table){assert.equal(table,"shane_sites");return {insert(payload){inserted=payload;return this},select(){return this},single:async()=>({data:{...inserted,id:"site-1"}})}}};
(async()=>{const result=await provision(client,{spec,vision:"A community garden with events"});assert.equal(result.status,"draft");assert.deepEqual(result.provisionedModules,["pages"]);assert.ok(result.pendingModules.includes("events"));assert.equal(inserted.owner_id,"owner-1");assert.equal(inserted.status,"draft");assert.equal(inserted.content.pages[0].draft,true);console.log("PASS owner-scoped private site foundation and honest pending services")})().catch(e=>{console.error(e);process.exitCode=1});

(async()=>{
 const spec=engine.compose({endeavorId:"unsaved-draft",title:"Garden",modules:["pages"]});
 let updated;
 const client={auth:{getUser:async()=>({data:{user:{id:"owner-1"}}})},from(){return {
  select(){return this},eq(){return this},update(p){updated=p;return this},
  single:async()=>updated?{data:{...updated,id:"existing-site"}}:{data:{id:"existing-site",owner_id:"owner-1",status:"draft",content:{pages:[{title:"Custom page"}],custom:"keep"}}}
 }}};
 const result=await provision(client,{spec,vision:"A renewed garden",siteId:"existing-site"});
 assert.equal(result.siteId,"existing-site");
 assert.equal(updated.content.custom,"keep");
 assert.equal(updated.content.pages[0].title,"Custom page");
 console.log("PASS existing site content preserved during refinement");
})().catch(e=>{console.error(e);process.exitCode=1});
