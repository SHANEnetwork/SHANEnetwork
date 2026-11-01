/* Creation stays central: carry the current endeavor vision into existing Network pages. */
(()=>{"use strict";
function init(){
 const host=document.getElementById("shane-endeavor-next"),status=document.getElementById("shaneEndeavorNextStatus");
 if(!host)return;
 host.addEventListener("click",event=>{
  const link=event.target.closest("a[data-endeavor-path]");if(!link)return;
  const destination=link.dataset.endeavorPath;
  const vision=document.getElementById("visionPrompt")?.value.trim()||"";
  const reply=document.getElementById("shaneIdeaReply")?.value.trim()||"";
  const text=vision||reply;
  if(!text){event.preventDefault();if(status)status.textContent="Describe your vision above before carrying it into another part of SHANE.";document.getElementById("visionPrompt")?.focus();return}
  let endeavorId=null;
  try{const active=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null");if(active&&typeof active.id==="string")endeavorId=active.id}catch{}
  try{sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:text,endeavorId,created:Date.now()}))}catch{}
  if(endeavorId&&window.SHANEEndeavorPlan?.create){
   event.preventDefault();
   window.SHANEEndeavorPlan.create({vision:text,endeavorId}).then(plan=>{
    const combined=(plan.vision+(plan.latestRequest!==plan.vision?"\n\nCurrent refinement: "+plan.latestRequest:""));
    sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:combined,endeavorId,created:Date.now(),context:{purpose:plan.vision,latestRequest:plan.latestRequest,revision:plan.revision,steps:plan.steps.map(step=>({capabilityId:step.capabilityId,status:step.status}))}}));
    location.assign(link.href);
   }).catch(()=>location.assign(link.href));
  }
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();