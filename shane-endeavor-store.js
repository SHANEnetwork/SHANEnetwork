/* SHANE endeavor persistence, using existing owner-scoped tables.
   No service-role key; caller supplies an authenticated Supabase client. */
(function(root,factory){
 const api=factory(root.SHANEComposition||(typeof module==="object"&&module.exports?require("./shane-composition.js"):null));
 if(typeof module==="object"&&module.exports)module.exports=api;else root.SHANEEndeavorStore=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(engine){
 "use strict";
 if(!engine)throw Error("Composition engine required");
 function conversationState(){const state=typeof SHANEConversationState!=="undefined"?SHANEConversationState:(typeof require==="function"?require("./shane-conversation-state.js"):null);if(!state)throw Error("Conversation state module missing");return state;}
 async function owner(client){
   if(!client||!client.auth||!client.auth.getUser||!client.from)throw Error("Authenticated Supabase client required");
   const {data,error}=await client.auth.getUser();
   if(error||!data?.user?.id)throw Error("Sign in before saving your endeavor");
   return data.user.id;
 }
 async function save(client,{title,vision,spec,endeavorId,conversation,region,audience,resources}){
   const userId=await owner(client);
   const errors=engine.validate(spec);if(errors.length)throw Error(errors.join("; "));
   if(typeof vision!=="string"||!vision.trim())throw Error("Vision required");
   if(spec.endeavorId!=="unsaved-draft"&&endeavorId&&spec.endeavorId!==endeavorId)throw Error("Endeavor identity mismatch");
   if(!endeavorId&&spec.endeavorId!=="unsaved-draft")throw Error("New endeavors require an unsaved draft identity");
   const prior=endeavorId?await load(client,endeavorId):null;
   if(prior&&!prior.canEdit)throw Error("Only the endeavor owner can save changes");
   const stableSpec={...spec,endeavorId:endeavorId||spec.endeavorId,...(prior?.linkedOrganizationId?{shaneOrganizationId:prior.linkedOrganizationId}:{})};
   const payload={owner_id:userId,title:title||spec.title,idea:vision,plan:conversationState().pack(stableSpec,conversation===undefined?(prior?.conversation||[]):conversation)};
   if(!endeavorId){payload.region=region||"";payload.audience=audience||"";payload.resources=resources||"";}
   else{if(region!==undefined)payload.region=region;if(audience!==undefined)payload.audience=audience;if(resources!==undefined)payload.resources=resources;}
   let request;
   if(endeavorId){
     request=client.from("shane_endeavors").update(payload).eq("id",endeavorId).eq("owner_id",userId).select("id,owner_id,title,idea,plan").single();
   }else{
     request=client.from("shane_endeavors").insert(payload).select("id,owner_id,title,idea,plan").single();
   }
   const {data,error}=await request;
   if(error)throw Error("Could not save endeavor: "+error.message);
   if(!data||data.owner_id!==userId)throw Error("Endeavor ownership verification failed");
   if(!endeavorId){
     const canonicalPlan=conversationState().pack({...stableSpec,endeavorId:data.id},conversation===undefined?[]:conversation);
     const {data:confirmed,error:canonicalError}=await client.from("shane_endeavors").update({plan:canonicalPlan}).eq("id",data.id).eq("owner_id",userId).select("id,owner_id,plan").single();
     if(canonicalError||!confirmed||confirmed.owner_id!==userId||confirmed.plan!==canonicalPlan){
       try{return await recover(client,data.id);}catch(recoveryError){
       const failure=Error("Endeavor created but canonical identity persistence failed; use the returned endeavorId to recover the saved draft");
       failure.endeavorId=data.id;
       failure.recoverable=true;
       failure.cause=recoveryError;
       throw failure;
       }
     }
   }
   return {id:data.id,title:data.title,spec:{...stableSpec,endeavorId:data.id},vision:data.idea,conversation:conversation===undefined?(prior?.conversation||[]):conversation,linkedSiteId:prior?.linkedSiteId||null,linkedOrganizationId:stableSpec.shaneOrganizationId||null,persisted:true,accessRole:"owner",canEdit:true};
 }
 async function recover(client,id){
   const userId=await owner(client);
   if(typeof id!=="string"||!id.trim())throw Error("Endeavor ID required");
   const {data,error}=await client.from("shane_endeavors").select("id,owner_id,plan").eq("id",id).eq("owner_id",userId).single();
   if(error||!data||data.owner_id!==userId)throw Error("Owned endeavor unavailable for recovery");
   let stored;
   try{stored=conversationState().unpack(data.plan);}catch{throw Error("Stored endeavor cannot be recovered automatically");}
   if(stored.spec.endeavorId===id)return load(client,id);
   if(stored.spec.endeavorId!=="unsaved-draft")throw Error("Recovery identity mismatch");
   const plan=conversationState().pack({...stored.spec,endeavorId:id},stored.turns);
   const {data:updated,error:updateError}=await client.from("shane_endeavors").update({plan}).eq("id",id).eq("owner_id",userId).select("id,owner_id,plan").single();
   if(updateError||!updated||updated.owner_id!==userId||updated.plan!==plan)throw Error("Could not finalize endeavor recovery");
   return load(client,id);
 }
 async function load(client,id){
   const userId=await owner(client);
   if(typeof id!=="string"||!id.trim())throw Error("Endeavor ID required");
   const {data,error}=await client.from("shane_endeavors").select("id,owner_id,title,idea,plan,linked_site_id").eq("id",id).single();
   if(error)throw Error("Could not load endeavor: "+error.message);
   if(!data)throw Error("Endeavor unavailable");
   // RLS allows owners and active invitees to read; never grant write authority here.
   const isOwner=data.owner_id===userId;
   if(!isOwner){
     const {data:membership,error:membershipError}=await client.from("shane_endeavor_members")
       .select("status,role").eq("endeavor_id",id).eq("user_id",userId).eq("status","active").single();
     if(membershipError||!membership||membership.status!=="active")throw Error("Active collaboration required");
   }
   let spec;try{spec=conversationState().unpack(data.plan).spec}catch{throw Error("Stored composition is invalid or conversation data is malformed")}
   if(spec.endeavorId!==id&&spec.endeavorId!=="unsaved-draft")throw Error("Stored endeavor identity mismatch");
   const errors=engine.validate(spec);if(errors.length)throw Error("Stored composition invalid: "+errors.join("; "));
   return {id,title:data.title,vision:data.idea,spec,conversation:conversationState().unpack(spec).turns,linkedSiteId:data.linked_site_id,linkedOrganizationId:spec.shaneOrganizationId||null,persisted:true,accessRole:isOwner?"owner":"collaborator",canEdit:isOwner};
 }
 async function loadAssessment(client,id){
   const userId=await owner(client);
   if(typeof id!=="string"||!id.trim())throw Error("Endeavor ID required");
   const {data,error}=await client.from("shane_endeavors").select("id,owner_id,title,idea,region,audience,resources,plan,linked_site_id").eq("id",id).single();
   if(error||!data)throw Error("Endeavor unavailable");
   const isOwner=data.owner_id===userId;
   if(!isOwner){
     const {data:membership,error:membershipError}=await client.from("shane_endeavor_members").select("status").eq("endeavor_id",id).eq("user_id",userId).eq("status","active").single();
     if(membershipError||!membership||membership.status!=="active")throw Error("Active collaboration required");
   }
   let structured=false;
   try{const parsed=conversationState().unpack(data.plan);structured=Boolean(parsed.spec&&parsed.spec.endeavorId);}catch{}
   if(structured)throw Error("This endeavor uses structured composition; use load instead");
   return {id:data.id,title:data.title,vision:data.idea,region:data.region,audience:data.audience,resources:data.resources,assessment:data.plan,linkedSiteId:data.linked_site_id,persisted:true,format:"legacy-assessment",accessRole:isOwner?"owner":"collaborator",canEdit:isOwner};
 }
 async function linkSite(client,endeavorId,siteId){
   const userId=await owner(client);
   if(!endeavorId||!siteId)throw Error("Endeavor and site IDs required");
   const {data:site,error:siteError}=await client.from("shane_sites").select("id,owner_id,status").eq("id",siteId).eq("owner_id",userId).single();
   if(siteError||!site||site.owner_id!==userId||site.status!=="draft")throw Error("Private site ownership/status verification failed");
   const {data,error}=await client.from("shane_endeavors").update({linked_site_id:siteId}).eq("id",endeavorId).eq("owner_id",userId).select("id,owner_id,linked_site_id").single();
   if(error||!data||data.owner_id!==userId||data.linked_site_id!==siteId)throw Error("Could not link private site to endeavor");
   return {endeavorId:data.id,siteId:data.linked_site_id};
 }
 async function linkOrganization(client,endeavorId,organizationId){
   const userId=await owner(client);
   if(!endeavorId||!organizationId)throw Error("Endeavor and organization IDs required");
   const {data:org,error:orgError}=await client.from("shane_organizations").select("id,owner_id").eq("id",organizationId).eq("owner_id",userId).single();
   if(orgError||!org||org.owner_id!==userId)throw Error("Organization ownership verification failed");
   const saved=await load(client,endeavorId);
   const spec={...saved.spec,shaneOrganizationId:organizationId};
   const {data,error}=await client.from("shane_endeavors").update({plan:conversationState().pack(spec,saved.conversation)}).eq("id",endeavorId).eq("owner_id",userId).select("id,owner_id,plan").single();
   if(error||!data||data.owner_id!==userId)throw Error("Could not link organization to endeavor");
   return {endeavorId:data.id,organizationId};
 }
 async function list(client){
   const userId=await owner(client);
   const {data:rows,error}=await client.from("shane_endeavors")
     .select("id,owner_id,title,updated_at").order("updated_at",{ascending:false}).limit(100);
   if(error)throw Error("Could not list endeavors: "+error.message);
   if(!Array.isArray(rows))throw Error("Unexpected endeavor list response");
   // RLS limits results to owned endeavors and active collaborator projects.
   const shared=rows.filter(item=>item.owner_id!==userId);
   let membershipIds=new Set();
   if(shared.length){
     const {data:memberships,error:memberError}=await client.from("shane_endeavor_members")
       .select("endeavor_id,status").eq("user_id",userId).eq("status","active");
     if(memberError)throw Error("Could not verify shared endeavors: "+memberError.message);
     membershipIds=new Set((memberships||[]).filter(m=>m.status==="active").map(m=>m.endeavor_id));
   }
   return rows.filter(item=>item.owner_id===userId||membershipIds.has(item.id))
     .map(item=>({id:item.id,title:item.title,updatedAt:item.updated_at,
       accessRole:item.owner_id===userId?"owner":"collaborator",canEdit:item.owner_id===userId}));
 }
 return Object.freeze({save,load,loadAssessment,recover,list,linkSite,linkOrganization});
});
