/* Prepare existing custom build request from a person's words; no network submission. */
(()=>{"use strict";function init(){const button=document.getElementById("shaneBuildRequestPrepare");if(!button)return;
try{const raw=sessionStorage.getItem("shane-intent-handoff-v1");if(raw){const item=JSON.parse(raw),field=document.getElementById("shaneBuildRequestGoal");if(item&&item.destination==="request-build.html"&&typeof item.text==="string"&&Date.now()-item.created<86400000&&field&&!field.value.trim()){field.value=item.text.slice(0,4000);document.getElementById("shaneBuildRequestReply").textContent="Your idea is ready to become a build request.";sessionStorage.removeItem("shane-intent-handoff-v1")}}}catch{}
const draftKey="shane-conversation-draft:request-build.html",input=document.getElementById("shaneBuildRequestGoal");
try{const saved=JSON.parse(sessionStorage.getItem(draftKey)||"null");if(saved&&typeof saved.text==="string"&&Date.now()-saved.updated<604800000&&!input.value.trim()){input.value=saved.text.slice(0,4000);document.getElementById("shaneBuildRequestReply").textContent="Your unfinished build idea is ready to continue."}}catch{}
input.addEventListener("input",()=>{try{if(input.value.trim())sessionStorage.setItem(draftKey,JSON.stringify({text:input.value.slice(0,4000),updated:Date.now()}));else sessionStorage.removeItem(draftKey)}catch{}});
button.addEventListener("click",()=>{const input=document.getElementById("shaneBuildRequestGoal"),text=input.value.trim();if(!text){input.focus();return}
const project=document.getElementById("project"),details=document.getElementById("details"),kind=document.getElementById("kind");
const first=text.split(/[.!?\n]/).map(s=>s.trim()).find(Boolean)||text;
if(!project.value.trim())project.value=first.replace(/^(?:i want to |we want to |i'd like to |we'd like to |please |build |create )/i,"").slice(0,120);
if(!details.value.trim())details.value=text.slice(0,5000);
if(kind){const t=text.toLowerCase();const options=[...kind.options];const target=/nonprofit|charity|project|community/.test(t)?"Project or nonprofit website":/redesign|rebuild|existing website/.test(t)?"Website redesign":/member|portal|integration/.test(t)?"Member portal or custom integration":null;if(target){const option=options.find(o=>o.textContent===target);if(option)kind.value=option.value}}
document.getElementById("shaneBuildRequestDetails").open=true;
document.getElementById("shaneBuildRequestReply").textContent="Request prepared. Review the details and add your contact email before creating the email draft.";
details.scrollIntoView({behavior:"smooth",block:"center"});
})}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init()})();