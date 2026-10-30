/* SHANE collaboration invitations. No implicit acceptance or publication. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.SHANEInvitations=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 async function identity(client){
  if(!client?.auth?.getUser||!client?.from||!client?.rpc)throw Error("Authenticated client required");
  const {data,error}=await client.auth.getUser();
  if(error||!data?.user?.id)throw Error("Sign in to manage invitations");
  return data.user.id;
 }
 async function pending(client){
  const userId=await identity(client);
  const {data,error}=await client.from("shane_endeavor_members")
   .select("endeavor_id,role,status,created_at")
   .eq("user_id",userId).eq("status","invited").order("created_at",{ascending:false});
  if(error)throw Error("Could not load invitations: "+error.message);
  return data||[];
 }
 async function respond(client,endeavorId,accept){
  if(typeof endeavorId!=="string"||!endeavorId.trim()||typeof accept!=="boolean")throw Error("Valid invitation and decision required");
  await identity(client);
  const {data,error}=await client.rpc("shane_respond_to_endeavor_invite",{p_endeavor_id:endeavorId,p_accept:accept});
  if(error)throw Error("Could not respond to invitation: "+error.message);
  if(data!==true)throw Error("Invitation is no longer pending or is unavailable");
  return {endeavorId,accepted:accept};
 }
 return Object.freeze({pending,respond});
});
