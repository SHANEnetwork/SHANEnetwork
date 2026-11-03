/* Receive a vision from SHANE's conversational entry and invoke the existing draft creator. */
(()=>{"use strict";
function arrive(){
 const field=document.getElementById("visionPrompt"),button=document.getElementById("shaneBuildVisionNow"),status=document.getElementById("visionStatus");
 if(!field||!button)return;
 let handoff=null;
 try{handoff=JSON.parse(sessionStorage.getItem("shane-creative-handoff-v1")||"null")}catch{}
 if(!handoff||typeof handoff.text!=="string"||!handoff.text.trim()||!Number.isFinite(handoff.created)||Date.now()-handoff.created>3600000)return;
 // Never replace work already being edited, or re-trigger a stale creation.
 if(field.value.trim()){if(status)status.textContent="Your incoming vision is saved in this browser. The current draft has been preserved.";return}
 const idea=handoff.text.trim().slice(0,10000);
 field.value=idea;field.dispatchEvent(new Event("input",{bubbles:true}));
 try{sessionStorage.removeItem("shane-creative-handoff-v1")}catch{}
 if(status)status.textContent="Your vision has arrived. SHANE is preparing its first editable draft.";
 // Only the existing private draft action is invoked; never publish, message or invite.
 if(!button.disabled)button.click();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",arrive,{once:true});else arrive();
})();