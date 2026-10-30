const test=require("node:test");
const assert=require("node:assert/strict");
const invitations=require("../shane-invitations.js");
const user="11111111-1111-4111-8111-111111111111";
const endeavor="22222222-2222-4222-8222-222222222222";
function client(){
 const calls=[];
 return {calls,auth:{getUser:async()=>({data:{user:{id:user}}})},
 from(table){assert.equal(table,"shane_endeavor_members");return {select(){return this},eq(k,v){calls.push([k,v]);return this},order:async()=>({data:[{endeavor_id:endeavor,role:"viewer",status:"invited"}]})}},
 rpc:async(name,args)=>{calls.push([name,args]);return {data:true}}
 };
}
test("Invitation inbox only requests current user's pending rows",async()=>{
 const c=client(),rows=await invitations.pending(c);
 assert.equal(rows.length,1);
 assert.deepEqual(c.calls.slice(0,2),[["user_id",user],["status","invited"]]);
});
test("Accepting an invitation requires an explicit boolean",async()=>{
 const c=client();await assert.rejects(()=>invitations.respond(c,endeavor,"yes"),/decision/);
 assert.equal(c.calls.length,0);
});
test("Decline calls the scoped invitation response function",async()=>{
 const c=client();const result=await invitations.respond(c,endeavor,false);
 assert.equal(result.accepted,false);
 assert.deepEqual(c.calls[0],["shane_respond_to_endeavor_invite",{p_endeavor_id:endeavor,p_accept:false}]);
});
test("A missing pending invitation cannot be treated as success",async()=>{
 const c=client();c.rpc=async()=>({data:false});
 await assert.rejects(()=>invitations.respond(c,endeavor,true),/no longer pending/);
});

test("Accepting an invitation calls the invitee-scoped RPC and does not publish",async()=>{
 const c=client();const result=await invitations.respond(c,endeavor,true);
 assert.deepEqual(result,{endeavorId:endeavor,accepted:true});
 assert.deepEqual(c.calls,[["shane_respond_to_endeavor_invite",{p_endeavor_id:endeavor,p_accept:true}]]);
});
test("Invitation RPC errors do not become successful acceptances",async()=>{
 const c=client();c.rpc=async()=>({data:null,error:{message:"Invitation expired"}});
 await assert.rejects(()=>invitations.respond(c,endeavor,true),/Invitation expired/);
});
