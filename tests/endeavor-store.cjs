const assert=require("node:assert/strict");const engine=require("../shane-composition.js");const store=require("../shane-endeavor-store.js");
const spec=engine.compose({endeavorId:"unsaved-draft",title:"Garden",modules:["pages","events"]});
let user="owner-a",rows=new Map(),counter=0;
function client(){return {auth:{getUser:async()=>({data:{user:{id:user}}})},from(table){assert.ok(["shane_endeavors","shane_sites","shane_organizations"].includes(table));let mode,record,filters={};const q={insert(v){mode="insert";record=v;return q},update(v){mode="update";record=v;return q},select(){return q},eq(k,v){filters[k]=v;return q},order(){return q},limit(){return q},then(resolve,reject){return q.single().then(resolve,reject)},single:async()=>{if(mode==="insert"){const id="endeavor-"+(++counter),row={...record,id,revision:1};rows.set(id,row);return {data:row}}if(table==="shane_organizations"&&!mode){return {data:{id:filters.id,owner_id:filters.owner_id}}}if(table==="shane_sites"&&!mode){return {data:{id:filters.id,owner_id:filters.owner_id,status:"draft"}}}if(!mode&&Object.prototype.hasOwnProperty.call(filters,"id")){const row=rows.get(filters.id);if(!row||(filters.owner_id!==undefined&&row.owner_id!==filters.owner_id)||(filters.owner_id===undefined&&row.owner_id!==user))return {error:{message:"Not found"}};return {data:row}}if(!mode){const items=[...rows.values()].filter(x=>x.owner_id===user&&(filters.owner_id===undefined||x.owner_id===filters.owner_id));return {data:items.map(x=>({id:x.id,owner_id:x.owner_id,title:x.title,updated_at:"2026-10-29T00:00:00Z"}))}}if(mode==="update"){const old=rows.get(filters.id);if(!old||old.owner_id!==filters.owner_id||(filters.plan!==undefined&&old.plan!==filters.plan)||(filters.title!==undefined&&old.title!==filters.title)||(filters.idea!==undefined&&old.idea!==filters.idea)||(filters.revision!==undefined&&old.revision!==filters.revision))return {data:null,error:null};const row={...old,...record,revision:old.revision+1};rows.set(filters.id,row);return {data:row}}const row=rows.get(filters.id);if(!row||row.owner_id!==filters.owner_id)return {error:{message:"Not found"}};return {data:row}}};return q}}}
(async()=>{
 const a=await store.save(client(),{title:"Garden",vision:"A garden with events",spec,conversation:[{role:"you",text:"A garden with events"}]});assert.equal(a.persisted,true);
 const loaded=await store.load(client(),a.id);assert.equal(loaded.vision,"A garden with events");assert.equal(loaded.conversation[0].text,"A garden with events");
 user="owner-b";await assert.rejects(store.load(client(),a.id),/Could not load/);
 user="owner-a";const updated=await store.save(client(),{endeavorId:a.id,title:"Garden 2",vision:"More gardens",spec});assert.equal(updated.title,"Garden 2");assert.ok(Number.isInteger(a.revision)&&a.revision>=2,"Initial save returns canonical revision");assert.equal(a.revision,(await store.load(client(),a.id)).revision-1,"Initial save revision matches subsequent update");assert.equal((await store.load(client(),a.id)).conversation[0].text,"A garden with events");
 const revision=(await store.load(client(),a.id)).planRaw;
 const competing=await store.save(client(),{endeavorId:a.id,title:"Garden 3",vision:"More gardens",spec,expectedPlan:revision,conversation:[{role:"you",text:"Add more flower beds"}]});
 assert.equal(competing.title,"Garden 3");
 await assert.rejects(store.save(client(),{endeavorId:a.id,title:"Stale overwrite",vision:"Old version",spec,expectedPlan:revision}),/changed/);
 assert.equal((await store.load(client(),a.id)).title,"Garden 3");
 const titleRevision=(await store.load(client(),a.id)).planRaw;
 const titleChanged=await store.save(client(),{endeavorId:a.id,title:"Garden 4",vision:"More gardens",spec,expectedPlan:titleRevision,expectedTitle:"Garden 3",expectedRevision:(await store.load(client(),a.id)).revision});
 assert.equal(titleChanged.title,"Garden 4");
 await assert.rejects(store.save(client(),{endeavorId:a.id,title:"Outdated title",vision:"More gardens",spec,expectedPlan:titleRevision,expectedTitle:"Garden 3"}),/changed/);
 assert.equal((await store.load(client(),a.id)).title,"Garden 4");
 const linked=await store.linkSite(client(),a.id,"site-1");assert.equal(linked.siteId,"site-1");assert.equal((await store.load(client(),a.id)).linkedSiteId,"site-1");
 const beforeSite=(await store.load(client(),a.id)).revision;
 assert.ok(beforeSite>1,"Site linking must advance the revision");
 const originalFrom=client;
 function competingClient(){
   const c=originalFrom(),from=c.from.bind(c);let injected=false;
   c.from=(table)=>{const q=from(table);if(table!=="shane_endeavors")return q;
     const update=q.update.bind(q);q.update=(payload)=>{const result=update(payload);
       if(!injected){injected=true;const row=rows.get(a.id);rows.set(a.id,{...row,revision:row.revision+1,region:"concurrent edit"});}
       return result;
     };return q;
   };return c;
 }
 await assert.rejects(store.linkOrganization(competingClient(),a.id,"org-conflict"),/Could not link organization/);
 assert.equal((await store.load(client(),a.id)).linkedOrganizationId,null,"Concurrent organization link must not overwrite the plan");
 await assert.rejects(store.linkSite(competingClient(),a.id,"site-conflict"),/Could not link private site/);
 assert.equal((await store.load(client(),a.id)).linkedSiteId,"site-1","Concurrent site link must not replace the linked site");
 const org=await store.linkOrganization(client(),a.id,"org-1");assert.equal(org.organizationId,"org-1");assert.equal((await store.load(client(),a.id)).linkedOrganizationId,"org-1");assert.equal((await store.load(client(),a.id)).conversation[0].text,"Add more flower beds");
 const listed=await store.list(client());assert.ok(listed.some(x=>x.id===a.id));
 await assert.rejects(store.save(client(),{title:"bad",vision:"x",spec:{}}),/Unsupported schema version/);
 console.log("PASS authenticated owner-scoped endeavor save, update, reload and simulated cross-owner denial");
})().catch(e=>{console.error(e);process.exitCode=1});
