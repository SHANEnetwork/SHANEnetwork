const test=require("node:test");const assert=require("node:assert/strict");const connector=require("../shane-network-connector.js");
const user="11111111-1111-4111-8111-111111111111",endeavor="22222222-2222-4222-8222-222222222222",listing="33333333-3333-4333-8333-333333333333";
function mock({existing=null,ownsEndeavor=true}={}){
 const calls=[];
 const client={auth:{getUser:async()=>({data:{user:{id:user}},error:null})},from(table){
  const query={select(){return this},eq(){return this},async maybeSingle(){
   if(table==="shane_endeavors")return {data:ownsEndeavor?{id:endeavor,owner_id:user}:null,error:null};
   if(table==="shane_listings")return {data:existing,error:null};
   return {data:null,error:null};
  },insert(payload){calls.push({table,action:"insert",payload});return {select(){return {single:async()=>({data:{id:listing,status:"draft",endeavor_id:endeavor},error:null})}}}};
  },update(payload){calls.push({table,action:"update",payload});return {eq(){return this},select(){return {maybeSingle:async()=>({data:{id:listing},error:null})}}}};
  }};return query;
 }};return {client,calls};
}
test("new endeavor creates only a private draft",async()=>{
 const {client,calls}=mock();const result=await connector.upsertEndeavorDraft(client,endeavor,{title:"A new project",description:"Idea"});
 assert.equal(result.status,"draft");assert.equal(calls.length,1);assert.equal(calls[0].payload.status,"draft");assert.equal(calls[0].payload.owner_id,user);
});
test("existing private draft is never overwritten by autosave",async()=>{
 const {client,calls}=mock({existing:{id:listing,status:"draft",owner_id:user}});
 const result=await connector.upsertEndeavorDraft(client,endeavor,{title:"Different title",description:"Different text"});
 assert.equal(result.unchanged,true);assert.equal(result.status,"draft");assert.equal(calls.length,0);
});
test("published listing stays published and unchanged",async()=>{
 const {client,calls}=mock({existing:{id:listing,status:"published",owner_id:user}});
 const result=await connector.upsertEndeavorDraft(client,endeavor,{title:"Overwrite attempt"});
 assert.equal(result.unchanged,true);assert.equal(result.status,"published");assert.equal(calls.length,0);
});
test("publication requires explicit approval",async()=>{
 const {client,calls}=mock();await assert.rejects(connector.publish(client,listing),/Explicit publication permission/);assert.equal(calls.length,0);
});
test("invalid endeavor identifier rejected before database access",async()=>{
 const {client,calls}=mock();await assert.rejects(connector.upsertEndeavorDraft(client,"not-an-id",{title:"x"}),/Valid endeavor ID/);assert.equal(calls.length,0);
});
\ntest("foreign endeavor is not provisioned",async()=>{\n const {client,calls}=mock({ownsEndeavor:false});\n await assert.rejects(connector.upsertEndeavorDraft(client,endeavor,{title:"Foreign"}),/not owned/);\n assert.equal(calls.length,0);\n});\n