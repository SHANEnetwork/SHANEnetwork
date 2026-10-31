/* Account-backed continuation in existing SHANE navigation, not another panel.
   The member chooses when to restore an idea; nothing is published automatically. */
(()=>{"use strict";
const UUID=/^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
async function init(){
 const nav=document.querySelector(".shane-unified-nav");if(!nav)return;
 const link=document.createElement("a");link.href="builder.html#shane-idea-conversation";
 link.textContent="Continue last saved idea";link.hidden=true;link.className="shane-saved-resume-link";
 nav.append(link);
 let store=window.SHANEConversationStore;
 if(!store){
  await new Promise(resolve=>{let settled=false;const done=()=>{if(!settled){settled=true;resolve()}};document.addEventListener("shane:conversation-store-ready",done,{once:true});setTimeout(done,3500)});
  store=window.SHANEConversationStore;
 }
 if(!store)return;
 try{
  const account=await store.connectedUser();if(!account)return;
  const rows=await store.list({limit:15});
  const latest=rows.find(row=>typeof row.body==="string"&&row.body.trim()&&["idea","vision","submitted-idea","community-vision","campaign-vision","listing-vision"].includes(row.entry_kind))||rows.find(row=>typeof row.body==="string"&&row.body.trim());
  if(!latest)return;
  link.hidden=false;
  link.setAttribute("aria-label","Continue your last saved SHANE idea in the creator");
  link.addEventListener("click",()=>{
   try{
    sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:latest.body.slice(0,4000),created:Date.now()}));
    if(latest.endeavor_id&&UUID.test(latest.endeavor_id))sessionStorage.setItem("shane-active-endeavor-v1",JSON.stringify({id:latest.endeavor_id,updated:Date.now()}));
   }catch{}
  });
 }catch{/* Signed-out visitors and unavailable history retain the ordinary navigation. */}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>void init(),{once:true});else void init();
})();