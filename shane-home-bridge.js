/* Progressive homepage bridge. Existing welcome submission and builder intake remain authoritative. */
(()=>{"use strict";
function init(){
 // Use the same AI workspace as every other SHANE page. The legacy
 // homepage form remains a fallback if the shared workspace is unavailable.
 const heroForm=document.getElementById("shane-home-vision-form");
 const heroIdea=document.getElementById("shane-home-vision");
 const heroStatus=document.getElementById("shane-home-vision-status");
 if(heroForm&&heroIdea){
  heroForm.addEventListener("submit",event=>{
   const workspace=document.getElementById("shane-conversation-workspace");
   const composer=workspace?.querySelector("#shane-shared-vision-input");
   if(!composer)return;
   event.preventDefault();event.stopImmediatePropagation();
   const idea=heroIdea.value.trim();
   if(!idea){if(heroStatus)heroStatus.textContent="Describe your idea to begin.";return}
   composer.value=idea;
   composer.dispatchEvent(new Event("input",{bubbles:true}));
   workspace.scrollIntoView({behavior:"smooth",block:"start"});
   const active=window.SHANECurrentEndeavor?.read?.();
   const talk=Array.from(workspace.querySelectorAll("button")).find(button=>button.textContent==="Talk with SHANE AI");
   if(talk&&!talk.disabled){
    talk.click();
    if(heroStatus)heroStatus.textContent="Your idea is continuing in SHANE's shared conversation.";
   }else{
    composer.focus({preventScroll:true});
    if(heroStatus)heroStatus.textContent="Your idea is in SHANE's shared workspace. Select or save an endeavor there to continue with AI.";
   }
  },true);
 }
 const welcome=document.getElementById("shane-home-create");
 if(!welcome)return;
 const links=document.createElement("nav");links.setAttribute("aria-label","Continue your SHANE journey");links.className="shane-journey-links";
 links.style.cssText="display:flex;flex-wrap:wrap;gap:12px 22px;margin-top:20px;padding-top:18px;border-top:1px solid #e6d2c9";
 const paths=[["Return to my endeavors","dashboard.html"],["Find collaborators","network.html"],["Open my conversations","conversation-history.html"],["Explore communities","communities.html"],["Organize a campaign","campaigns.html"],["Coordinate a workspace","workspace.html"],["Plan growth","growth.html"]];
 for(const [label,href] of paths){const a=document.createElement("a");a.href=href;a.textContent=label;a.style.cssText="color:#76506a;font-weight:650";links.append(a)}
 welcome.append(links);
 const destinations=new Set(["network.html","communities.html","my-network.html","campaigns.html","workspace.html","growth.html"]);
 links.addEventListener("click",event=>{
  const anchor=event.target.closest("a");if(!anchor)return;
  const page=anchor.getAttribute("href"),destination=destinations.has(page)?page:null;
  const vision=welcome.querySelector("textarea")?.value.trim();
  if(!destination||!vision)return;
  let endeavorId=null;try{const id=window.SHANECurrentEndeavor?.read?.();if(typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id))endeavorId=id}catch{}
  try{sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:vision.slice(0,4000),endeavorId,created:Date.now()}))}catch{}
 });

 const idea=welcome.querySelector("textarea");if(!idea)return;
 const note=document.createElement("p");note.style.cssText="color:#70576a;font-size:.91rem;margin:12px 0 0";
 note.textContent="Your idea moves directly into SHANE’s creation conversation. You can refine it there before publishing.";
 idea.insertAdjacentElement("afterend",note);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();