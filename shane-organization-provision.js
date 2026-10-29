/* Owner-scoped organization provisioning for SHANE's community-oriented visions.
   No invitations, member creation, public posts, or publication. */
(function(root,factory){const api=factory(root.SHANEComposition||(typeof module==="object"&&module.exports?require("./shane-composition.js"):null));if(typeof module==="object"&&module.exports)module.exports=api;else root.SHANEOrganizationProvision=api;})(typeof globalThis!=="undefined"?globalThis:this,function(engine){
"use strict";
async function provision(client,{spec,vision,organizationId}){
 const errors=engine.validate(spec);if(errors.length)throw Error(errors.join("; "));
 if(!client?.auth?.getUser||!client?.from)throw Error("Authenticated client required");
 const {data:auth,error:authError}=await client.auth.getUser();
 if(authError||!auth?.user?.id)throw Error("Sign in before creating an organization");
 const ownerId=auth.user.id;
 const modules=spec.modules.map(m=>m.type);
 const settings={pager:"off",rooms:modules.includes("discussions")?"on":"off",friends:"off",membership:"invitation",reviewMode:"staff",profileVisibility:"private"};
 const payload={owner_id:ownerId,name:spec.title,description:String(vision||"").slice(0,4000),category:"community",settings};
 let previousSettings=null;
 if(organizationId){
  const {data:existing,error:existingError}=await client.from("shane_organizations").select("id,owner_id,settings").eq("id",organizationId).eq("owner_id",ownerId).single();
  if(existingError||!existing||existing.owner_id!==ownerId)throw Error("Existing organization ownership verification failed");
  previousSettings=existing.settings||{};
  payload.settings={...previousSettings,rooms:modules.includes("discussions")?"on":previousSettings.rooms||"off"};
 }
 const query=organizationId?client.from("shane_organizations").update(payload).eq("id",organizationId).eq("owner_id",ownerId):client.from("shane_organizations").insert(payload);
 const {data,error}=await query.select("id,owner_id,name,settings").single();
 if(error)throw Error("Private organization setup failed: "+error.message);
 if(!data||data.owner_id!==ownerId)throw Error("Organization ownership verification failed");
 return {organizationId:data.id,configured:{discussions:payload.settings.rooms==="on",membership:payload.settings.membership},publicPostsCreated:0,membersInvited:0};
}
return Object.freeze({provision});
});
