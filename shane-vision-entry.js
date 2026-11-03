/* Receive a vision from SHANE's conversational entry and invoke the existing draft creator. */
(()=>{"use strict";
function arrive(){
 const field=document.getElementById("visionPrompt"),button=document.getElementById("shaneBuildVisionNow"),send=document.getElementById("shaneIdeaSend"),status=document.getElementById("visionStatus");
 if(!field||!button||!send)return;
 let handoff=null;
 try{handoff=JSON.parse(sessionStorage.getItem("shane-creative-handoff-v1")||"null")}catch{}
 if(!handoff||typeof handoff.text!=="string"||!handoff.text.trim()||!Number.isFinite(handoff.created)||Date.now()-handoff.created>3600000)return;
 // Never replace work already being edited, or re-trigger a stale creation.
 if(field.value.trim()&&field.value.trim()!==handoff.text.trim().slice(0,10000)){if(status)status.textContent="Your incoming vision is saved in this browser. The current draft has been preserved.";return}
 const idea=handoff.text.trim().slice(0,10000);
 field.value=idea;field.dispatchEvent(new Event("input",{bubbles:true}));
 // Only consume the handoff after the private draft action can actually start.
 // A disabled button may indicate an in-progress request or an unavailable creator.
 if(button.disabled||send.disabled){if(status)status.textContent="Your vision is ready, but SHANE cannot start another draft yet. Your idea is preserved.";return}
 if(status)status.textContent="Your vision has arrived. SHANE is preparing its first editable draft.";
 // Only the existing private draft action is invoked; never publish, message or invite.
 button.click();
 try{sessionStorage.removeItem("shane-creative-handoff-v1")}catch{}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",arrive,{once:true});else arrive();
})();