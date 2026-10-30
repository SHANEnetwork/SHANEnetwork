const test=require("node:test");
const assert=require("node:assert/strict");
const api=require("../shane-collaborators.js");
const owner="11111111-1111-4111-8111-111111111111";
const endeavor="33333333-3333-4333-8333-333333333333";
function client(allowed){
 const calls=[];
 const chain={select(){return this},eq(k,v){calls.push([k,v]);return this},order(){return Promise.resolve({data:[{user_id:"member",role:"viewer",status:"invited"}]})},maybeSingle(){return Promise.resolve({data:allowed?{owner_id:owner}:null})}};
 return {calls,auth:{getUser:async()=>({data:{user:{id:owner}}})},from:t=>{calls.push(["table",t]);return Object.create(chain)}};
}
test("Owner can list collaborators without changing membership",async()=>{
 const c=client(true);const rows=await api.list(c,endeavor);
 assert.equal(rows.length,1);
 assert.deepEqual(c.calls.filter(x=>x[0]==="table").map(x=>x[1]),["shane_endeavors","shane_endeavor_members"]);
});
test("Non-owner cannot query collaborator directory",async()=>{
 const c=client(false);await assert.rejects(()=>api.list(c,endeavor),/Only the owner/);
 assert.equal(c.calls.some(x=>x[1]==="shane_endeavor_members"),false);
});
