/* Receive a vision from SHANE's conversational entry and invoke the existing draft creator. */
(()=>{"use strict";

// Load the same shared endeavor foundation used by Network pages.
// This avoids replacing the large existing creator application.
if(!window.SHANEEndeavorCore&&!document.querySelector('script[src="shane-endeavor-core.js"]')){
 const script=document.createElement("script");script.src="shane-endeavor-core.js";script.dataset.shaneCoreLoader="true";document.head.append(script);
}
document.addEventListener("shane:endeavor-account-saved",event=>{
 const id=event.detail?.id;
 if(window.SHANEEndeavorCore&&typeof id==="string")window.SHANEEndeavorCore.update({id,source:"creator"},"saved");
});
function rememberDraft(){
 // Preserve an unfinished creative thought across navigation and refresh.
 const field=document.getElementById("visionPrompt");
 const reply=document.getElementById("shaneIdeaReply");
 const key="shane-private-vision-draft-v1";
 if(!field)return;
 let stored=null;
 try{stored=JSON.parse(sessionStorage.getItem(key)||"null")}catch{}
 if(!field.value.trim()&&stored&&typeof stored.text==="string"&&Number.isFinite(stored.created)&&Date.now()-stored.created<86400000){
  field.value=stored.text.slice(0,10000);
  field.dispatchEvent(new Event("input",{bubbles:true}));
 }
 let pending=null;
 const save=()=>{
  const value=field.value.trim();
  try{if(value)sessionStorage.setItem(key,JSON.stringify({text:value.slice(0,10000),created:Date.now()}));else sessionStorage.removeItem(key)}catch{}
 };
 field.addEventListener("input",save);
 window.addEventListener("pagehide",save);
 if(reply){
  reply.addEventListener("keydown",event=>{
   if(event.key==="Enter"&&(event.ctrlKey||event.metaKey)&&!event.isComposing){
    event.preventDefault();const send=document.getElementById("shaneIdeaSend");if(send&&!send.disabled)send.click();
   }
  });
 }
 document.addEventListener("shane:endeavor-account-saved",()=>{
  try{sessionStorage.removeItem(key)}catch{}
 });
}
function arrive(){
 const field=document.getElementById("visionPrompt"),button=document.getElementById("shaneBuildVisionNow"),status=document.getElementById("visionStatus");
 if(!field||!button)return;
 let handoff=null;
 try{handoff=JSON.parse(sessionStorage.getItem("shane-creative-handoff-v1")||"null")}catch{}
 if(!handoff||typeof handoff.text!=="string"||!handoff.text.trim()||!Number.isFinite(handoff.created)||Date.now()-handoff.created>3600000)return;
 // Never replace work already being edited, or re-trigger a stale creation.
 if(field.value.trim()){
  if(field.value.trim()===handoff.text.trim()){
   try{sessionStorage.removeItem("shane-creative-handoff-v1")}catch{}
   if(!button.disabled)button.click();
   return;
  }
  if(status)status.textContent="Your incoming vision is saved in this browser. The current draft has been preserved.";return
 }
 const idea=handoff.text.trim().slice(0,10000);
 window.SHANEEndeavorCore?.update({id:null,vision:idea,source:"creator"},"arrived");
 field.value=idea;field.dispatchEvent(new Event("input",{bubbles:true}));
 try{sessionStorage.removeItem("shane-creative-handoff-v1")}catch{}
 if(status)status.textContent="Your vision has arrived. SHANE is preparing its first editable draft.";
 // Only the existing private draft action is invoked; never publish, message or invite.
 if(!button.disabled)button.click();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{arrive();rememberDraft()},{once:true});else{arrive();rememberDraft()}
})();