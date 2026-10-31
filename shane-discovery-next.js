/* Carry a person's discovery goal into an existing SHANE workflow. No automatic publication. */
(()=>{"use strict";
function init(){
 const host=document.getElementById("shaneDiscoveryNext"),wish=document.getElementById("shaneDiscoveryWish"),form=document.getElementById("shaneDiscoveryConversation");
 if(!host||!wish||!form)return;
 const show=()=>{if(wish.value.trim())host.hidden=false};
 form.addEventListener("submit",show);
 host.addEventListener("click",event=>{
  const link=event.target.closest("a[data-shane-next]");if(!link)return;
  const text=wish.value.trim();if(!text)return;
  const destination=link.dataset.shaneNext;
  try{
   if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text,created:Date.now()}));
   else sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text,created:Date.now()}));
  }catch{}
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();