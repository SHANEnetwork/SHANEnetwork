/* Private reusable site foundation, provisioned from a creator's interpreted vision.
   Uses existing shane_sites with owner-scoped RLS. Never publishes automatically. */
(function(root,factory){
 const api=factory(root.SHANEComposition||(typeof module==="object"&&module.exports?require("./shane-composition.js"):null));
 if(typeof module==="object"&&module.exports)module.exports=api;else root.SHANEProvision=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(engine){
 "use strict";
 if(!engine)throw Error("Composition engine required");
 async function provision(client,{spec,vision,siteId}){
  const errors=engine.validate(spec);if(errors.length)throw Error(errors.join("; "));
  if(!client?.auth?.getUser||!client?.from)throw Error("Authenticated client required");
  const {data:auth,error:authError}=await client.auth.getUser();
  if(authError||!auth?.user?.id)throw Error("Sign in before creating a private website");
  const ownerId=auth.user.id;
  const content={shaneComposition:{schemaVersion:spec.schemaVersion,modules:spec.modules,appearance:spec.appearance},sourceVision:String(vision||"").slice(0,12000),pages:[{title:"Home",slug:"home",draft:true}]};
  const payload={owner_id:ownerId,name:spec.title,content,status:"draft"};
  const query=siteId
    ?client.from("shane_sites").update(payload).eq("id",siteId).eq("owner_id",ownerId)
    :client.from("shane_sites").insert(payload);
  const {data,error}=await query.select("id,owner_id,name,status,content").single();
  if(error)throw Error("Private site creation failed: "+error.message);
  if(!data||data.owner_id!==ownerId||data.status!=="draft")throw Error("Private site ownership/status verification failed");
  return {siteId:data.id,status:"draft",persisted:true,provisionedModules:["pages"],pendingModules:spec.modules.filter(m=>m.type!=="pages").map(m=>m.type)};
 }
 return Object.freeze({provision});
});
