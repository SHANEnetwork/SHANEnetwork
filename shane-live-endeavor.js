/* Read-only, account-authorized endeavor context for the conversational studio.
   Reuses the existing Supabase client and RLS; never copies private briefs to public pages. */
(()=>{"use strict";
const $=id=>document.getElementById(id),KEY="shane-active-endeavor-v1";
const validId=id=>typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id);
function activeId(){try{const value=JSON.parse(sessionStorage.getItem(KEY)||"null")?.id;return validId(value)?value:null}catch{return null}}
function init(){
 const hub=$("shane-idea-conversation");if(!hub)return;
 const panel=document.createElement("section");panel.id="shane-live-endeavor";panel.setAttribute("aria-label","Active endeavor context");
 panel.innerHTML='<style>#shane-live-endeavor{padding:18px;margin:18px 0;border-radius:20px;background:#fff9f3;border:1px solid #e4cdd4}#shane-live-endeavor h3{font:700 1.4rem Georgia,serif;color:#69445d;margin:0 0 7px}#shane-live-endeavor p{margin:6px 0 12px;color:#665261}#shane-live-endeavor dl{display:grid;grid-template-columns:max-content 1fr;gap:8px 14px;margin:10px 0}#shane-live-endeavor dt{font-weight:700;color:#65445a}#shane-live-endeavor dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}#shane-live-endeavor button{padding:10px 15px;background:#76516a;border:0;border-radius:20px;color:white;cursor:pointer;font:600 14px system-ui}#shane-live-endeavor .brief{max-height:170px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}#shane-live-endeavor [hidden]{display:none!important}</style><h3>The endeavor we are building</h3><p id="shane-live-status" role="status">Open a saved account endeavor to see its current direction here.</p><button type="button" id="shane-live-resume" hidden>Return to my latest saved endeavor</button><div id="shane-live-details" hidden><dl><dt>Endeavor</dt><dd id="shane-live-title"></dd><dt>Audience</dt><dd id="shane-live-audience"></dd><dt>Region</dt><dd id="shane-live-region"></dd></dl><strong>Current vision</strong><p class="brief" id="shane-live-idea"></p><button type="button" id="shane-live-use">Bring this vision into the conversation</button></div>';
 hub.append(panel);
 const status=$("shane-live-status"),details=$("shane-live-details");
 let record=null,generation=0;const resume=$("shane-live-resume");
 async function latestOwned(sb,user){const {data,error}=await sb.from("shane_endeavors").select("id,title").eq("owner_id",user.id).order("updated_at",{ascending:false}).limit(1);if(error)throw error;return data?.[0]||null}
 async function load(){
  const run=++generation;record=null;details.hidden=true;resume.hidden=true;
  const id=activeId();
  const sb=window.shaneAccountDb;if(!sb){status.textContent="Waiting for SHANE's account connection…";return}
  status.textContent="Loading your private endeavor context…";
  try{
   const {data:{user},error:authError}=await sb.auth.getUser();if(run!==generation)return;
   if(authError||!user){status.textContent="Sign in through Members to access this endeavor's private details.";return}
   if(!id){const latest=await latestOwned(sb,user);if(run!==generation)return;if(!latest){status.textContent="Describe an idea to begin your first endeavor.";return}resume.hidden=false;resume.textContent="Return to "+(latest.title||"my latest endeavor");resume.onclick=()=>{if(!validId(latest.id))return;sessionStorage.setItem(KEY,JSON.stringify({id:latest.id,updated:new Date().toISOString()}));document.dispatchEvent(new CustomEvent("shane:endeavor-changed",{detail:{id:latest.id}}))};status.textContent="Your saved work is ready. Continue the conversation where you left off.";return}
   const {data,error}=await sb.from("shane_endeavors").select("id,title,idea,region,audience,updated_at").eq("id",id).eq("owner_id",user.id).maybeSingle();
   if(run!==generation)return;
   if(error){status.textContent="Unable to load endeavor: "+error.message;return}
   if(!data){status.textContent="This endeavor is not available in your account. Choose a saved endeavor from your dashboard.";return}
   record=data;$("shane-live-title").textContent=data.title||"Untitled endeavor";$("shane-live-audience").textContent=data.audience||"Not specified";$("shane-live-region").textContent=data.region||"Not specified";$("shane-live-idea").textContent=data.idea||"No vision recorded yet";details.hidden=false;status.textContent="Private endeavor context loaded from your SHANE account. Nothing has been published.";
  }catch(e){if(run===generation)status.textContent="Could not load endeavor context: "+(e.message||String(e))}
 }
 $("shane-live-use").onclick=()=>{
  if(!record?.idea)return;const field=$("visionPrompt");if(!field)return;
  if(field.value.trim()&&field.value.trim()!==record.idea&&!confirm("Replace the current vision text with this saved endeavor? Your website draft will stay unchanged."))return;
  field.value=record.idea.slice(0,12000);field.dispatchEvent(new Event("input",{bubbles:true}));status.textContent="Saved endeavor vision brought into the conversation. The existing website draft is unchanged.";field.focus();
 };
 document.addEventListener("shane:endeavor-changed",load);
 document.addEventListener("shane:active-endeavor-changed",load);
 document.addEventListener("shane:endeavor-context-ready",load);
 document.addEventListener("shane:account-db-ready",load);
 document.addEventListener("shane:auth-changed",load);
 load();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();