/* Shared SHANE Network connector. Public discovery needs no login.
   Writes require a real Supabase user and existing owner-scoped RLS.
   Never embed service-role credentials or publish a draft implicitly. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.SHANENetworkConnector=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const CATEGORIES=new Set(["business","project","service","person","organization","event","opportunity"]);
function safeUrl(value){
 if(!value)return null;
 try{const u=new URL(String(value).trim());return ["https:","http:"].includes(u.protocol)?u.href:null}catch{return null}
}
function prepare(input={}){
 const title=String(input.title||input.name||"").trim().slice(0,150);
 if(!title)throw new Error("A title is required.");
 const category=CATEGORIES.has(input.category)?input.category:"project";
 const website_url=safeUrl(input.website_url||input.websiteUrl);
 if((input.website_url||input.websiteUrl)&&!website_url)throw new Error("Use an http or https website address.");
 return {title,category,description:String(input.description||input.summary||"").trim().slice(0,4000),
  region:String(input.region||"").trim().slice(0,200),website_url,endeavor_id:input.endeavor_id||null};
}
async function userFor(client){
 if(!client?.auth?.getUser)throw new Error("A connected SHANE account is required.");
 const {data,error}=await client.auth.getUser();
 if(error)throw error;
 if(!data?.user?.id)throw new Error("Sign in to SHANE before saving a listing.");
 return data.user;
}
async function discover(client,{query="",limit=30}={}){
 if(!client?.from)throw new Error("SHANE network connection unavailable.");
 const n=Math.min(100,Math.max(1,Number(limit)||30));
 const {data,error}=await client.from("shane_listings")
 .select("id,title,category,description,region,website_url,created_at")
 .eq("status","published").order("created_at",{ascending:false}).limit(n);
 if(error)throw error;
 const q=String(query).trim().toLowerCase();
 return q?(data||[]).filter(x=>[x.title,x.category,x.description,x.region].some(v=>String(v||"").toLowerCase().includes(q))):data||[];
}
async function saveDraft(client,input){
 const user=await userFor(client);
 const payload={...prepare(input),owner_id:user.id,status:"draft",attribution_confirmed:false};
 const {data,error}=await client.from("shane_listings").insert(payload).select("id,title,status").single();
 if(error)throw error;
 return data;
}
async function updateOwnDraft(client,id,input){
 const user=await userFor(client);
 if(!id)throw new Error("Listing ID required.");
 const {data,error}=await client.from("shane_listings")
 .update((()=>{const {endeavor_id,...fields}=prepare(input);return {...fields,status:"draft",attribution_confirmed:false};})())
 .eq("id",id).eq("owner_id",user.id).eq("status","draft")
 .select("id,title,status").maybeSingle();
 if(error)throw error;
 if(!data)throw new Error("Private draft not found or not editable.");
 return data;
}
async function publish(client,id,{permissionConfirmed=false}={}){
 if(!permissionConfirmed)throw new Error("Explicit publication permission is required.");
 const user=await userFor(client);
 const {data,error}=await client.from("shane_listings")
 .update({status:"published",attribution_confirmed:true})
 .eq("id",id).eq("owner_id",user.id).eq("status","draft")
 .select("id,title,status").maybeSingle();
 if(error)throw error;
 if(!data)throw new Error("Draft not found or already published.");
 return data;
}
async function upsertEndeavorDraft(client,endeavorId,input){
 const user=await userFor(client);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(endeavorId)))throw new Error("Valid endeavor ID required.");
 const {data:endeavor,error:endeavorError}=await client.from("shane_endeavors").select("id,owner_id").eq("id",endeavorId).eq("owner_id",user.id).maybeSingle();
 if(endeavorError)throw endeavorError;
 if(!endeavor)throw new Error("This endeavor is not owned by your account.");
 const {data:existing,error:lookupError}=await client.from("shane_listings").select("id,status,owner_id").eq("endeavor_id",endeavorId).eq("owner_id",user.id).maybeSingle();
 if(lookupError)throw lookupError;
 const payload={...prepare(input),endeavor_id:endeavorId};
 if(existing){
  // Respect edits already made to a network draft; autosave is not publication approval.
  return {id:existing.id,status:existing.status,endeavor_id:endeavorId,unchanged:true};
 }
 const {data,error}=await client.from("shane_listings").insert({...payload,owner_id:user.id,status:"draft",attribution_confirmed:false}).select("id,title,status,endeavor_id").single();
 if(error){
  if(error.code==="23505"){
   const retry=await client.from("shane_listings").select("id,status,endeavor_id").eq("endeavor_id",endeavorId).eq("owner_id",user.id).maybeSingle();
   if(!retry.error&&retry.data)return {...retry.data,unchanged:true};
  }
  throw error;
 }
 return data;
}
async function myListings(client,{limit=50}={}){
 const user=await userFor(client);
 const n=Math.max(1,Math.min(100,Number(limit)||50));
 const {data,error}=await client.from("shane_listings")
 .select("id,title,category,description,region,website_url,status,endeavor_id,created_at")
 .eq("owner_id",user.id).order("created_at",{ascending:false}).limit(n);
 if(error)throw error;
 return data||[];
}
async function unpublish(client,id){
 const user=await userFor(client);
 if(!id)throw Error("Listing ID required.");
 const {data,error}=await client.from("shane_listings")
 .update({status:"draft",attribution_confirmed:false})
 .eq("id",id).eq("owner_id",user.id).eq("status","published")
 .select("id,title,status").maybeSingle();
 if(error)throw error;
 if(!data)throw Error("Owned published listing not found.");
 return data;
}
return Object.freeze({prepare,discover,saveDraft,updateOwnDraft,upsertEndeavorDraft,publish,unpublish,myListings,safeUrl});
});
