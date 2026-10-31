/* The same endeavor vision can continue through SHANE's existing Network capabilities. */
(()=>{"use strict";
function init(){
 const form=document.getElementById("visionForm"),idea=document.getElementById("visionInput"),host=document.getElementById("shaneNetworkVisionActions");
 if(!form||!idea||!host)return;
 form.addEventListener("submit",()=>{if(idea.value.trim())host.hidden=false});
 host.addEventListener("click",event=>{
  const link=event.target.closest("a[data-network-next]");if(!link)return;
  const text=idea.value.trim();if(!text)return;
  const destination=link.dataset.networkNext;
  try{
   if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text,created:Date.now()}));
   else sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text,created:Date.now()}));
  }catch{}
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();