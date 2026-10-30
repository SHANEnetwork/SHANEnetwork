/* Owner-only collaborator directory for SHANE endeavors. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.SHANECollaborators=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 async function list(client,endeavorId){
  if(!client?.auth?.getUser||!client?.from)throw Error("Authenticated client required");
  if(typeof endeavorId!=="string"||!endeavorId.trim())throw Error("Endeavor ID required");
  const auth=await client.auth.getUser();
  if(auth.error||!auth.data?.user?.id)throw Error("Sign in to manage collaborators");
  const ownerId=auth.data.user.id;
  const check=await client.from("shane_endeavors").select("id,owner_id").eq("id",endeavorId).eq("owner_id",ownerId).maybeSingle();
  if(check.error||check.data?.owner_id!==ownerId)throw Error("Only the owner can manage collaborators");
  const result=await client.from("shane_endeavor_members").select("user_id,role,status,created_at").eq("endeavor_id",endeavorId).order("created_at",{ascending:false});
  if(result.error)throw Error("Could not load collaborators: "+result.error.message);
  return result.data||[];
 }
 return Object.freeze({list});
});
