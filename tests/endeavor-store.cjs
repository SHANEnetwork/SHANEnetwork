const assert=require("node:assert/strict");const engine=require("../shane-composition.js");const store=require("../shane-endeavor-store.js");
const spec=engine.compose({endeavorId:"unsaved-draft",title:"Garden",modules:["pages","events"]});
let user="owner-a",rows=new Map(),counter=0;
function client(){return {auth:{getUser:async()=>({data:{user:{id:user}}})},from(table){assert.equal(table,"shane_endeavors");let mode,record,filters={};const q={insert(v){mode="insert";record=v;return q},update(v){mode="update";record=v;return q},select(){return q},eq(k,v){filters[k]=v;return q},order(){return q},limit(){return q},then(resolve,reject){return q.single().then(resolve,reject)},single:async()=>{if(mode==="insert"){const id="endeavor-"+(++counter),row={...record,id};rows.set(id,row);return {data:row}}if(!mode){const items=[...rows.values()].filter(x=>x.owner_id===filters.owner_id);return {data:items.map(x=>({id:x.id,owner_id:x.owner_id,title:x.title,updated_at:"2026-10-29T00:00:00Z"}))}}if(mode==="update"){const old=rows.get(filters.id);if(!old||old.owner_id!==filters.owner_id)return {error:{message:"Not found"}};const row={...old,...record};rows.set(filters.id,row);return {data:row}}const row=rows.get(filters.id);if(!row||row.owner_id!==filters.owner_id)return {error:{message:"Not found"}};return {data:row}}};return q}}}
(async()=>{
 const a=await store.save(client(),{title:"Garden",vision:"A garden with events",spec,conversation:[{role:"you",text:"A garden with events"}]});assert.equal(a.persisted,true);
 const loaded=await store.load(client(),a.id);assert.equal(loaded.vision,"A garden with events");assert.equal(loaded.conversation[0].text,"A garden with events");
 user="owner-b";await assert.rejects(store.load(client(),a.id),/Could not load/);
 user="owner-a";const updated=await store.save(client(),{endeavorId:a.id,title:"Garden 2",vision:"More gardens",spec});assert.equal(updated.title,"Garden 2");
 const listed=await store.list(client());assert.ok(listed.some(x=>x.id===a.id));
 await assert.rejects(store.save(client(),{title:"bad",vision:"x",spec:{}}),/Unsupported schema version/);
 console.log("PASS authenticated owner-scoped endeavor save, update, reload and simulated cross-owner denial");
})().catch(e=>{console.error(e);process.exitCode=1});
