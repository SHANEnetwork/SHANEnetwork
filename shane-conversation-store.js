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
window.SHANEConversationStore=Object.freeze({converse,saveTurn,list,continuityPacket,searchHistory,endeavors,endeavorContext:async(id,limit=40)=>id?(await list({endeavorId:id,limit})).reverse():[],setArchived,remove,exportHistory,flush,connectedUser:user,context:async(options={})=>(await list(options)).slice().reverse(),recent:async(limit=20,endeavorId=null)=>{const rows=await list({limit,endeavorId});return rows.map(row=>({text:row.body,page:row.source_page,kind:row.entry_kind,at:row.created_at,endeavorId:row.endeavor_id}))}});
document.dispatchEvent(new Event("shane:conversation-store-ready"));
void flush();
