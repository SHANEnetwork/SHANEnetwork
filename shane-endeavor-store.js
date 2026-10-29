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
 async function save(client,{title,vision,spec,endeavorId,conversation}){
   const userId=await owner(client);
   const errors=engine.validate(spec);if(errors.length)throw Error(errors.join("; "));
   if(typeof vision!=="string"||!vision.trim())throw Error("Vision required");
   if(spec.endeavorId!=="unsaved-draft"&&endeavorId&&spec.endeavorId!==endeavorId)throw Error("Endeavor identity mismatch");
   const payload={owner_id:userId,title:title||spec.title,idea:vision,plan:conversation===undefined?JSON.stringify(spec):conversationState().pack(spec,conversation)};
   let request;
   if(endeavorId){
     request=client.from("shane_endeavors").update(payload).eq("id",endeavorId).eq("owner_id",userId).select("id,owner_id,title,idea,plan").single();
   }else{
     request=client.from("shane_endeavors").insert(payload).select("id,owner_id,title,idea,plan").single();
   }
   const {data,error}=await request;
   if(error)throw Error("Could not save endeavor: "+error.message);
   if(!data||data.owner_id!==userId)throw Error("Endeavor ownership verification failed");
   return {id:data.id,title:data.title,spec,vision:data.idea,persisted:true};
 }
 async function load(client,id){
   const userId=await owner(client);
   if(typeof id!=="string"||!id.trim())throw Error("Endeavor ID required");
   const {data,error}=await client.from("shane_endeavors").select("id,owner_id,title,idea,plan,linked_site_id").eq("id",id).eq("owner_id",userId).single();
   if(error)throw Error("Could not load endeavor: "+error.message);
   if(!data||data.owner_id!==userId)throw Error("Endeavor ownership verification failed");
   let spec;try{spec=JSON.parse(data.plan)}catch{throw Error("Stored composition is not valid JSON")}
   if(spec.endeavorId!==id&&spec.endeavorId!=="unsaved-draft")throw Error("Stored endeavor identity mismatch");
   const errors=engine.validate(spec);if(errors.length)throw Error("Stored composition invalid: "+errors.join("; "));
   return {id,title:data.title,vision:data.idea,spec,conversation:conversationState().unpack(spec).turns,linkedSiteId:data.linked_site_id,persisted:true};
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
 async function list(client){
   const userId=await owner(client);
   const {data,error}=await client.from("shane_endeavors").select("id,owner_id,title,updated_at").eq("owner_id",userId).order("updated_at",{ascending:false}).limit(100);
   if(error)throw Error("Could not list endeavors: "+error.message);
   if(!Array.isArray(data))throw Error("Unexpected endeavor list response");
   if(data.some(item=>item.owner_id!==userId))throw Error("Endeavor ownership verification failed");
   return data.map(item=>({id:item.id,title:item.title,updatedAt:item.updated_at}));
 }
 return Object.freeze({save,load,list,linkSite});
});
