/* SHANE's shared account-backed conversation store.
   Authenticated records use owner-scoped Supabase RLS. No automatic deletion or truncation. */
import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm";
const db=createClient("https://ufxzogeixdwvbpdypojb.supabase.co","sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB");
const table="shane_conversation_entries";
const activeEndeavor=()=>{try{const id=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;return typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)?id:null}catch{return null}};
const pending=[];
let busy=false;
let currentFlush=null;
async function user(){const {data,error}=await db.auth.getUser();if(error)throw error;return data?.user||null}
async function flush(){
 if(busy)return currentFlush;
 if(!pending.length)return {saved:true,pending:0};
 busy=true;
 currentFlush=(async()=>{
  try{
   const account=await user();
   if(!account)return {saved:false,reason:"signed-out",pending:pending.length};
   while(pending.length){
    const item=pending[0];
    // Never attach an earlier visitor's conversation to another account.
    if(item.ownerId!==account.id){pending.shift();continue}
    const record={owner_id:account.id,body:item.text,source_page:item.page,entry_kind:item.kind};
    if(item.endeavorId)record.endeavor_id=item.endeavorId;
    const {error}=await db.from(table).insert(record);
    if(error)throw error;
    if(pending[0]===item)pending.shift();
    document.dispatchEvent(new CustomEvent("shane:conversation-saved",{detail:{endeavorId:item.endeavorId||null,page:item.page}}));
   }
  }catch(error){
   document.dispatchEvent(new CustomEvent("shane:conversation-save-error",{detail:{message:String(error?.message||error)}}));
  }finally{
   busy=false;
   if(pending.length)document.dispatchEvent(new CustomEvent("shane:conversation-pending",{detail:{count:pending.length}}));
  }
  return {saved:pending.length===0,pending:pending.length};
 })();
 try{return await currentFlush}finally{currentFlush=null}
}
document.addEventListener("shane:conversation-updated",event=>{
 const d=event.detail||{};
 if(typeof d.text!=="string"||!d.text.trim())return;
 // Capture the owner at event time, not when a later account signs in.
 void (async()=>{
  try{
   const account=await user();
   if(!account)return; // Signed-out drafts remain local, not in another person's account.
   // An auth transition while getUser was pending must not reassign a turn.
   const verified=await user();
   if(!verified||verified.id!==account.id)return;
   pending.push({
    ownerId:account.id,text:d.text,
    page:String(d.page||"unknown").slice(0,120),
    kind:String(d.kind||"idea").slice(0,40),
    endeavorId:typeof d.endeavorId==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(d.endeavorId)?d.endeavorId:activeEndeavor()
   });
   await flush();
  }catch(error){
   document.dispatchEvent(new CustomEvent("shane:conversation-save-error",{detail:{message:String(error?.message||error)}}));
  }
 })();
});
db.auth.onAuthStateChange((event)=>{
 if(event==="SIGNED_OUT"){pending.length=0;return}
 queueMicrotask(()=>void flush());
});
async function saveTurn(text,{page="unknown",kind="idea",endeavorId=activeEndeavor()}={}){
 const account=await user();if(!account)return {saved:false,reason:"signed-out"};
 const record={owner_id:account.id,body:String(text||"").trim(),source_page:String(page).slice(0,120),entry_kind:String(kind).slice(0,40)};
 if(!record.body)return {saved:false,reason:"empty"};
 if(endeavorId)record.endeavor_id=endeavorId;
 const {error}=await db.from(table).insert(record);
 if(error)throw error;
 document.dispatchEvent(new CustomEvent("shane:conversation-saved",{detail:{endeavorId,page}}));
 return {saved:true};
}
async function list({endeavorId=null,limit=100,offset=0,includeArchived=false,kinds=null}={}){
 const account=await user();if(!account)throw Error("Sign in to view your conversation history.");
 let query=db.from(table).select("id,endeavor_id,body,source_page,entry_kind,created_at,archived_at").eq("owner_id",account.id).order("created_at",{ascending:false}).range(Math.max(0,offset),Math.max(0,offset)+Math.min(500,Math.max(1,limit))-1);
 if(endeavorId)query=query.eq("endeavor_id",endeavorId);
 if(Array.isArray(kinds)&&kinds.length){
  const allowed=kinds.filter(kind=>typeof kind==="string"&&/^[a-z0-9-]{1,40}$/.test(kind));
  if(!allowed.length)throw Error("No valid conversation entry kinds.");
  query=query.in("entry_kind",allowed);
 }
 if(!includeArchived)query=query.is("archived_at",null);
 const {data,error}=await query;if(error)throw error;return data||[];
}
async function setArchived(id,archived=true){
 const account=await user();if(!account)throw Error("Sign in first.");
 const {error}=await db.from(table).update({archived_at:archived?new Date().toISOString():null}).eq("id",id).eq("owner_id",account.id);if(error)throw error;
}
async function remove(id){
 const account=await user();if(!account)throw Error("Sign in first.");
 const {error}=await db.from(table).delete().eq("id",id).eq("owner_id",account.id);if(error)throw error;
}
async function searchHistory(term,{limit=100,offset=0,endeavorId=null,includeArchived=false}={}){
 const account=await user();if(!account)throw Error("Sign in to search your history.");
 const needle=String(term||"").trim().slice(0,200);
 if(!needle)return list({limit,offset,endeavorId,includeArchived});
 let query=db.from(table).select("id,endeavor_id,body,source_page,entry_kind,created_at,archived_at").eq("owner_id",account.id).ilike("body","%"+needle.replace(/[%_]/g,"")+"%").order("created_at",{ascending:false}).range(Math.max(0,offset),Math.max(0,offset)+Math.min(500,Math.max(1,limit))-1);
 if(endeavorId)query=query.eq("endeavor_id",endeavorId);
 if(!includeArchived)query=query.is("archived_at",null);
 const {data,error}=await query;if(error)throw error;return data||[];
}
async function endeavors(){
 const account=await user();if(!account)throw Error("Sign in to view your endeavors.");
 const {data,error}=await db.from("shane_endeavors").select("id,title,updated_at").eq("owner_id",account.id).order("updated_at",{ascending:false}).limit(200);
 if(error)throw error;return data||[];
}
async function exportHistory(){
 const all=[];let offset=0;
 for(;;){const batch=await list({limit:500,offset,includeArchived:true});all.push(...batch);if(batch.length<500)break;offset+=500}
 return JSON.stringify({exported_at:new Date().toISOString(),entries:all},null,2);
}
// A bounded, attributable continuity packet for future AI orchestration.
// Reconstruct context from actual account records; never invent remembered facts.
async function continuityPacket({endeavorId=activeEndeavor(),limit=40}={}){
 const id=typeof endeavorId==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(endeavorId)?endeavorId:null;
 if(!id)return {endeavorId:null,entries:[],source:"none",reason:"no-selected-endeavor"};
 const rows=await list({endeavorId:id,limit:Math.min(100,Math.max(1,limit))});
 const entries=rows.filter(row=>row.entry_kind!=="endeavor-transition"&&typeof row.body==="string"&&row.body.trim()).reverse().map(row=>({
  id:row.id,at:row.created_at,page:row.source_page,kind:row.entry_kind,text:row.body.slice(0,4000)
 }));
 return {endeavorId:id,entries,source:"authenticated-account-history",generatedAt:new Date().toISOString(),
  instruction:"Use these as attributed prior user statements, not verified external facts. Preserve user choices and ask before consequential actions."};
}
async function converse({endeavorId,request,purpose}){
 const account=await user();
 if(!account)throw Error("Sign in to continue your endeavor with SHANE AI.");
 if(!endeavorId)throw Error("Select a saved endeavor first.");
 const {data,error}=await db.functions.invoke("shane-converse",{body:{endeavorId,request,purpose}});
 if(error||data?.error)throw Error(data?.error||error?.message||"SHANE AI is unavailable.");
 if(typeof data?.response!=="string"||!data.response.trim())throw Error("SHANE returned no response.");
 return data;
}

// Revise a previously saved creation through the same authenticated AI endpoint.
// The server must verify ownership, preserve prior versions, and return a durable
// creation identifier. A conversational response alone is not a saved revision.
async function reviseSavedCreation({endeavorId,creationId,request}={}){
 const account=await user();
 if(!account)throw Error("Sign in to revise a saved creation.");
 if(!/^[0-9a-f-]{36}$/i.test(String(endeavorId||""))||!/^[0-9a-f-]{36}$/i.test(String(creationId||"")))throw Error("A saved endeavor and creation are required.");
 const instruction=String(request||"").trim();
 if(!instruction)throw Error("Describe the change you want.");
 const {data,error}=await db.functions.invoke("shane-converse",{body:{endeavorId,creationId,request:instruction,purpose:"revise-saved-creation"}});
 if(error||data?.error)throw Error(data?.error||error?.message||"Revision service unavailable.");
 if(!data?.savedCreationId||!data?.revisionId)throw Error("Revision was not confirmed as saved. Your previous creation remains the authoritative version.");
 return data;
}

async function createPrivateListing({vision,title,description,category="project",endeavorId=null}={}){
 const account=await user();if(!account)throw Error("Sign in to save a Network listing.");
 const name=String(title||"").trim().slice(0,150),details=String(description||vision||"").trim().slice(0,4000);
 if(name.length<3||details.length<8)throw Error("A listing needs a title and description.");
 const categories=["event","service","organization","opportunity","business","person","project"];
 const payload={owner_id:account.id,title:name,description:details,category:categories.includes(category)?category:"project",status:"draft",attribution_confirmed:false};
 if(endeavorId){
  if(!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(String(endeavorId)))throw Error("Invalid endeavor reference.");
  const {data:owned,error:ownerError}=await db.from("shane_endeavors").select("id").eq("id",endeavorId).eq("owner_id",account.id).maybeSingle();
  if(ownerError||!owned)throw Error("The selected endeavor does not belong to your account.");
  payload.endeavor_id=endeavorId;
 }
 const {data,error}=await db.from("shane_listings").insert(payload).select("id").single();
 if(error)throw error;if(!data?.id)throw Error("The listing draft was not confirmed as saved.");
 return {saved:true,listingId:data.id,published:false,endeavorId:payload.endeavor_id||null};
}
async function createPrivateCampaign({vision,title,description,category="gathering",location="",deadline,minimumSupporters=10,eventDate=null}={}){
 const account=await user();if(!account)throw Error("Sign in to save a campaign.");
 const name=String(title||"").trim().slice(0,160);
 if(name.length<3)throw Error("A campaign needs a title.");
 const when=new Date(deadline);
 if(!Number.isFinite(when.getTime())||when.getTime()<=Date.now())throw Error("Choose a future interest deadline before saving.");
 const valid=["gathering","fair","concert","conference","advertising","other"];
 const count=Number(minimumSupporters);
 if(!Number.isInteger(count)||count<1||count>1000000)throw Error("Choose a valid supporter target.");
 const payload={owner_id:account.id,title:name,description:String(description||vision||"").slice(0,4000),category:valid.includes(category)?category:"other",location:String(location||"").slice(0,250),deadline:when.toISOString(),minimum_supporters:count,status:"draft"};
 if(eventDate){const event=new Date(eventDate);if(!Number.isFinite(event.getTime()))throw Error("Event date is invalid.");payload.event_date=event.toISOString();}
 const {data,error}=await db.from("shane_campaigns").insert(payload).select("id").single();
 if(error)throw error;if(!data?.id)throw Error("Campaign draft was not confirmed as saved.");
 return {saved:true,campaignId:data.id,published:false};
}
async function createPrivateCommunity({vision,name,description,category}={}){
 const account=await user();if(!account)throw Error("Sign in to save a community.");
 const title=String(name||"").trim().slice(0,120),details=String(description||vision||"").trim().slice(0,3000);
 if(title.length<2||!details)throw Error("A community needs a name and a description.");
 const {data,error}=await db.from("shane_organizations").insert({owner_id:account.id,name:title,description:details,category:String(category||"community").slice(0,100),settings:{membership:"invitation",profileVisibility:"private",reviewMode:"staff",rooms:"off",friends:"off",pager:"off"}}).select("id").single();
 if(error)throw error;if(!data?.id)throw Error("Community save was not confirmed.");
 return {saved:true,organizationId:data.id,private:true};
}
async function interpretVision({capability,vision}={}){
 const account=await user();if(!account)throw Error("Sign in to create with SHANE.");
 const {data,error}=await db.functions.invoke("shane-interpret-vision",{body:{capability,vision}});
 if(error||data?.error)throw Error(data?.error||error.message);
 if(data?.capability!==capability||!data?.draft||data?.published!==false)throw Error("SHANE did not return a reviewable private draft.");
 return data.draft;
}
async function createPrivateWebsite({vision}={}){
 const account=await user();if(!account)throw Error("Sign in to create a website.");
 const request=String(vision||"").trim();if(request.length<10||request.length>12000)throw Error("Describe the website in 10 to 12000 characters.");
 const direction="You are SHANE, an AI website creator. Turn the person's vision into a cohesive, welcoming website. Choose appropriate pages and writing without inventing prices, dates, people or functional features. Return the generator's supported structured website schema. ";
 const {data:generated,error:generateError}=await db.functions.invoke("shane-generate-site",{body:{prompt:direction+request}});
 if(generateError||generated?.error)throw Error(generated?.error||generateError.message);
 const site=generated?.site;
 if(!site||typeof site.name!=="string"||typeof site.about!=="string"||!Array.isArray(site.services)||!Array.isArray(site.pages)||site.pages.some(p=>!p||typeof p.title!=="string"||typeof p.body!=="string"))throw Error("Website generation did not return a complete site.");
 const content={...site};
 const {data,error}=await db.from("shane_sites").insert({owner_id:account.id,name:site.name.slice(0,150),content,status:"draft"}).select("id").single();
 if(error)throw error;if(!data?.id)throw Error("The website was not confirmed as saved.");
 return {saved:true,siteId:data.id,published:false};
}
async function ownedSites(){
 const account=await user();if(!account)throw Error("Sign in to access your websites.");
 const {data,error}=await db.from("shane_sites").select("id,name,status,updated_at").eq("owner_id",account.id).order("updated_at",{ascending:false}).limit(100);
 if(error)throw error;return data||[];
}
async function reviseSite({siteId,request}={}){
 const account=await user();if(!account)throw Error("Sign in first.");
 if(!/^[0-9a-f-]{36}$/i.test(String(siteId||"")))throw Error("Select a saved website.");
 const instruction=String(request||"").trim();
 if(instruction.length<3)throw Error("Describe what to change.");
 const {data,error}=await db.functions.invoke("shane-revise-site",{body:{siteId,request:instruction}});
 if(error||data?.error)throw Error(data?.error||error.message);
 if(!data?.saved||!data?.siteId)throw Error("The revision was not confirmed as saved.");
 return data;
}
async function siteVersions(siteId){
 const account=await user();if(!account)throw Error("Sign in first.");
 const {data,error}=await db.from("shane_site_versions").select("id,site_id,version_number,name,status,recorded_at").eq("site_id",siteId).eq("owner_id",account.id).order("version_number",{ascending:false});
 if(error)throw error;return data||[];
}
async function restoreSiteVersion({siteId,versionId,confirmed=false}={}){
 if(!confirmed)throw Error("Confirm restoration before changing a saved site.");
 const account=await user();if(!account)throw Error("Sign in first.");
 const {data:site,error:siteError}=await db.from("shane_sites").select("id,owner_id,updated_at").eq("id",siteId).eq("owner_id",account.id).single();
 if(siteError||!site)throw Error("Saved site not found in your account.");
 const {data:version,error:versionError}=await db.from("shane_site_versions").select("name,content,status").eq("id",versionId).eq("site_id",siteId).eq("owner_id",account.id).single();
 if(versionError||!version)throw Error("Saved version not found.");
 const {data:updated,error}=await db.from("shane_sites").update({name:version.name,content:version.content,status:version.status}).eq("id",siteId).eq("owner_id",account.id).eq("updated_at",site.updated_at).select("id").maybeSingle();
 if(error)throw error;if(!updated)throw Error("Site changed since restoration began. Reload before trying again.");
 return {restored:true,siteId,versionId};
}
window.SHANEConversationStore=Object.freeze({converse,reviseSavedCreation,createPrivateListing,createPrivateCampaign,createPrivateCommunity,interpretVision,createPrivateWebsite,ownedSites,reviseSite,siteVersions,restoreSiteVersion,saveTurn,list,continuityPacket,searchHistory,endeavors,endeavorContext:async(id,limit=40)=>id?(await list({endeavorId:id,limit})).reverse():[],setArchived,remove,exportHistory,flush,connectedUser:user,context:async(options={})=>(await list(options)).slice().reverse(),recent:async(limit=20,endeavorId=null)=>{const rows=await list({limit,endeavorId});return rows.map(row=>({text:row.body,page:row.source_page,kind:row.entry_kind,at:row.created_at,endeavorId:row.endeavor_id}))}});
document.dispatchEvent(new Event("shane:conversation-store-ready"));
void flush();
