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
  try{sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:text.slice(0,4000),endeavorId,created:Date.now()}))}catch{}
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();