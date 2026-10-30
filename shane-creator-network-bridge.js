/* Creator → Network bridge. Automatically prepares a PRIVATE listing draft.
   Never publishes, never overwrites a published listing, never exposes credentials.
   The owner may open their listing in the member area for review and publication. */
(function(){
"use strict";
const api=window.SHANENetworkConnector;
if(!api)return;
const key="shane_endeavor_network_drafts_v1";
let pending=Promise.resolve();
const status=document.createElement("p");status.id="shaneNetworkBridgeStatus";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
const link=document.createElement("a");link.href="members.html#mineSection";link.textContent="Review my network drafts";link.hidden=true;
const panel=document.createElement("section");panel.id="shaneNetworkBridge";panel.style.cssText="margin:16px auto;padding:16px;max-width:900px;border:1px solid #bdd4e9;border-radius:14px;background:#f0f7ff;color:#183454";
const heading=document.createElement("strong");heading.textContent="Your place in Shane Network";
const intro=document.createElement("p");intro.textContent="When you save your endeavor, SHANE also prepares a private network presence. Nothing appears publicly until you approve it.";
panel.append(heading,intro,status,link);
function mount(){const target=document.getElementById("shaneContinuityStatus")?.parentElement||document.querySelector("main")||document.body;target.append(panel)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
function read(){try{return JSON.parse(sessionStorage.getItem(key)||"{}")||{}}catch{return {}}}
function write(map){try{sessionStorage.setItem(key,JSON.stringify(map))}catch{}}
async function prepare(event){
 const d=event.detail||{},client=window.SHANEAuthenticatedClient;
 if(!client||!d.endeavorId)return;
 const map=read(),id=d.endeavorId;
 const title=String(d.title||"My endeavor").slice(0,150);
 const description=String(d.vision||"").trim().slice(0,4000);
 if(!description)return;
 status.textContent="Preparing your private network presence…";
 try{
  let listing;
  const previous=map[id];
  if(previous){
   const {data,error}=await client.from("shane_listings").select("id,status,owner_id").eq("id",previous).maybeSingle();
   if(error)throw error;
   if(data?.status==="published"){status.textContent="Your network presence is already published. SHANE will not overwrite it.";link.hidden=false;return}
   if(data?.status==="draft")listing=await api.updateOwnDraft(client,previous,{title,description,category:"project"});
  }
  if(!listing)listing=await api.saveDraft(client,{title,description,category:"project"});
  map[id]=listing.id;write(map);
  status.textContent="Your network draft is saved privately alongside your endeavor. Review it before publishing.";
  link.hidden=false;
 }catch(error){status.textContent="Your endeavor is saved. Network draft preparation needs attention: "+error.message}
}
document.addEventListener("shane:endeavor-saved",event=>{pending=pending.then(()=>prepare(event)).catch(error=>{status.textContent=error.message})});
})();