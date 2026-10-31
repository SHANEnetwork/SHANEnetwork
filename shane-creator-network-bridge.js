/* Creator → Network bridge. Automatically prepares a PRIVATE listing draft.
   Never publishes, never overwrites a published listing, never exposes credentials.
   The owner may open their listing in the member area for review and publication. */
(function(){
"use strict";
const api=window.SHANENetworkConnector;
if(!api)return;
let pending=Promise.resolve();
const status=document.createElement("p");status.id="shaneNetworkBridgeStatus";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
const link=document.createElement("a");link.href="members.html#mineSection";link.textContent="Review my network drafts";link.hidden=true;
const panel=document.createElement("section");panel.id="shaneNetworkBridge";panel.className="shane-network-presence-panel";
const heading=document.createElement("h3");heading.textContent="Your endeavor has a place in the network";
const intro=document.createElement("p");intro.textContent="Keep creating together. SHANE quietly prepares a private network presence alongside your endeavor, ready whenever you choose to share it.";
panel.append(heading,intro,status,link);
function mount(){const target=document.getElementById("shaneContinuityStatus")?.parentElement||document.querySelector("main")||document.body;target.append(panel)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
async function prepare(event){
 const d=event.detail||{},client=window.SHANEAuthenticatedClient;
 if(!client||!d.endeavorId)return;
 const id=d.endeavorId;
 const title=String(d.title||"My endeavor").slice(0,150);
 const description=String(d.vision||"").trim().slice(0,4000);
 if(!description)return;
 status.textContent="Preparing your private network presence…";
 try{
  const listing=await api.upsertEndeavorDraft(client,id,{title,description,category:"project"});
  if(listing.unchanged){
   status.textContent="Your network presence already exists. SHANE has preserved its owner-edited content and publication status.";
  }else{
   status.textContent="Your network draft is saved with your endeavor. It follows your account across devices and stays private until you approve publication.";
  }
  link.href="members.html?listing="+encodeURIComponent(listing.id)+"#mineSection";
  link.textContent=listing.status==="published"?"Manage my published destination":"Review my private network draft";
  link.hidden=false;
  document.dispatchEvent(new CustomEvent("shane:network-draft-ready",{detail:{endeavorId:id,listingId:listing.id,status:listing.status}}));
 }catch(error){status.textContent="Your endeavor is saved. Network draft preparation needs attention: "+error.message}
}
document.addEventListener("shane:endeavor-saved",event=>{pending=pending.then(()=>prepare(event)).catch(error=>{status.textContent=error.message})});
})();