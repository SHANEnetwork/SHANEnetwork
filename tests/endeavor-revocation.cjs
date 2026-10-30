const test=require("node:test");
const assert=require("node:assert/strict");
const revocation=require("../shane-revocation.js");
const owner="11111111-1111-4111-8111-111111111111";
const member="22222222-2222-4222-8222-222222222222";
const endeavor="33333333-3333-4333-8333-333333333333";
function client(){
 const calls=[];
 return {calls,auth:{getUser:async()=>({data:{user:{id:owner}}})},
 rpc:async(name,args)=>{calls.push([name,args]);return {data:true}}};
}
test("Revocation requires an explicit target",async()=>{
 const c=client();await assert.rejects(()=>revocation.revoke(c,endeavor,""),/identifiers/);
 assert.equal(c.calls.length,0);
});
test("Owner cannot revoke self through member operation",async()=>{
 const c=client();await assert.rejects(()=>revocation.revoke(c,endeavor,owner),/own membership/);
});
test("Revocation calls scoped server operation",async()=>{
 const c=client();const result=await revocation.revoke(c,endeavor,member);
 assert.equal(result.revoked,true);
 assert.deepEqual(c.calls[0],["shane_revoke_endeavor_member",{p_endeavor_id:endeavor,p_user_id:member}]);
});
test("Denied revocation does not report success",async()=>{
 const c=client();c.rpc=async()=>({data:false});
 await assert.rejects(()=>revocation.revoke(c,endeavor,member),/lack permission/);
});
