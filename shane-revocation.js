/* Owner-only collaborator revocation through a server-validated operation. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.SHANERevocation=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 async function revoke(client,endeavorId,userId){
  if(!client?.auth?.getUser||!client?.rpc)throw Error("Authenticated client required");
  if(typeof endeavorId!=="string"||!endeavorId.trim()||typeof userId!=="string"||!userId.trim())throw Error("Valid member identifiers required");
  const {data:auth,error:authError}=await client.auth.getUser();
  if(authError||!auth?.user?.id)throw Error("Sign in before managing collaborators");
  if(auth.user.id===userId)throw Error("Owner cannot revoke their own membership");
  const {data,error}=await client.rpc("shane_revoke_endeavor_member",{p_endeavor_id:endeavorId,p_user_id:userId});
  if(error)throw Error("Could not revoke collaborator: "+error.message);
  if(data!==true)throw Error("Membership unavailable or you lack permission");
  return {endeavorId,userId,revoked:true};
 }
 return Object.freeze({revoke});
});
