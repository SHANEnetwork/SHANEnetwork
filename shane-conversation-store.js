/* SHANE's shared account-backed conversation store.
   Authenticated records use owner-scoped Supabase RLS. No automatic deletion or truncation. */
import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm";
const db=createClient("https://ufxzogeixdwvbpdypojb.supabase.co","sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB");
const table="shane_conversation_entries";
const activeEndeavor=()=>{try{const id=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;return typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)?id:null}catch{return null}};
const pending=[];
let busy=false;
async function user(){const {data,error}=await db.auth.getUser();if(error)throw error;return data?.user||null}
async function flush(){
 if(busy||!pending.length)return;
 busy=true;
 try{
  const account=await user();if(!account)return;
  while(pending.length){
   const item=pending[0];
   const record={owner_id:account.id,body:item.text,source_page:item.page,entry_kind:item.kind};
   if(item.endeavorId)record.endeavor_id=item.endeavorId;
   let {error}=await db.from(table).insert(record);
   if(error&&record.endeavor_id){delete record.endeavor_id;({error}=await db.from(table).insert(record))}
   if(error)throw error;
   pending.shift();
  }
 }catch(error){document.dispatchEvent(new CustomEvent("shane:conversation-save-error",{detail:{message:String(error?.message||error)}}))}
 finally{busy=false}
}
document.addEventListener("shane:conversation-updated",event=>{
 const d=event.detail||{};
 if(typeof d.text!=="string"||!d.text.trim())return;
 pending.push({text:d.text.slice(0,20000),page:String(d.page||"unknown").slice(0,120),kind:String(d.kind||"idea").slice(0,40),endeavorId:activeEndeavor()});
 void flush();
});
db.auth.onAuthStateChange(()=>{queueMicrotask(()=>void flush())});
async function list({endeavorId=null,limit=100,offset=0,includeArchived=false}={}){
 const account=await user();if(!account)throw Error("Sign in to view your conversation history.");
 let query=db.from(table).select("id,endeavor_id,body,source_page,entry_kind,created_at,archived_at").eq("owner_id",account.id).order("created_at",{ascending:false}).range(Math.max(0,offset),Math.max(0,offset)+Math.min(500,Math.max(1,limit))-1);
 if(endeavorId)query=query.eq("endeavor_id",endeavorId);
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
 const escaped=needle.replace(/[\\%_]/g,"\\async function endeavors(){
 const account=await user();if(!account)throw Error("Sign in to view your endeavors.");
 const {data,error}=await db.from("shane_endeavors").select("id,title,updated_at").eq("owner_id",account.id).order("updated_at",{ascending:false}).limit(200);
 if(error)throw error;return data||[];
}
async function exportHistory(){");
 let query=db.from(table).select("id,endeavor_id,body,source_page,entry_kind,created_at,archived_at").eq("owner_id",account.id).ilike("body","%"+escaped+"%").order("created_at",{ascending:false}).range(Math.max(0,offset),Math.max(0,offset)+Math.min(500,Math.max(1,limit))-1);
 if(endeavorId)query=query.eq("endeavor_id",endeavorId);
 if(!includeArchived)query=query.is("archived_at",null);
 const {data,error}=await query;if(error)throw error;return data||[];
}
async function exportHistory(){
 const all=[];let offset=0;
 for(;;){const batch=await list({limit:500,offset,includeArchived:true});all.push(...batch);if(batch.length<500)break;offset+=500}
 return JSON.stringify({exported_at:new Date().toISOString(),entries:all},null,2);
}
window.SHANEConversationStore=Object.freeze({list,searchHistory,endeavors,setArchived,remove,exportHistory,flush,connectedUser:user,context:async(options={})=>(await list(options)).slice().reverse(),recent:async(limit=20)=>{const rows=await list({limit});return rows.slice().reverse().map(row=>({text:row.body,page:row.source_page,kind:row.entry_kind,at:row.created_at}))}});
document.dispatchEvent(new Event("shane:conversation-store-ready"));
void flush();
