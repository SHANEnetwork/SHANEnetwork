/* Conversational growth intake prepares existing local outreach tools without sending messages. */
(()=>{"use strict";
function init(){const button=document.getElementById("shaneGrowthPrepare");if(!button)return;
try{const raw=sessionStorage.getItem("shane-intent-handoff-v1");if(raw){const item=JSON.parse(raw);const field=document.getElementById("shaneGrowthGoal");if(item&&item.destination==="growth.html"&&typeof item.text==="string"&&Date.now()-item.created<86400000&&field&&!field.value.trim()){field.value=item.text.slice(0,4000);document.getElementById("shaneGrowthReply").textContent="Your endeavor's direction is ready for outreach preparation.";sessionStorage.removeItem("shane-intent-handoff-v1")}}}catch{}
const draftKey="shane-conversation-draft:growth.html",input=document.getElementById("shaneGrowthGoal");
try{const saved=JSON.parse(sessionStorage.getItem(draftKey)||"null");if(saved&&typeof saved.text==="string"&&Date.now()-saved.updated<604800000&&!input.value.trim()){input.value=saved.text.slice(0,4000);document.getElementById("shaneGrowthReply").textContent="Your unfinished outreach idea is ready to continue."}}catch{}
input.addEventListener("input",()=>{try{if(input.value.trim())sessionStorage.setItem(draftKey,JSON.stringify({text:input.value.slice(0,4000),updated:Date.now()}));else sessionStorage.removeItem(draftKey)}catch{}});
button.addEventListener("click",()=>{
const raw=document.getElementById("shaneGrowthGoal").value.trim();
if(!raw){document.getElementById("shaneGrowthGoal").focus();return}
const name=document.getElementById("project"),purpose=document.getElementById("purpose"),ask=document.getElementById("ask");
const first=raw.split(/[.!?\n]/).map(s=>s.trim()).find(Boolean)||raw;
const candidate=first.replace(/^(?:i am |i'm |we are |we're |i want to |we want to |i'd like to |we'd like to )/i,"").trim();
if(!name.value.trim())name.value=candidate.slice(0,120);
if(!purpose.value.trim())purpose.value=raw.slice(0,2000);
const seeking=raw.match(/(?:want|need|hope|looking|seeking) to (?:find|reach|meet|connect with|partner with|collaborate with) ([^.!?\n]+)/i);
if(!ask.value.trim())ask.value=(seeking?seeking[1]:"Find people and organizations interested in collaborating on this endeavor.").slice(0,1500);
document.getElementById("shaneGrowthWorkspace").open=true;
document.getElementById("shaneGrowthReply").textContent="Your project and outreach intention are prepared. Review the details, save locally, then prepare an introduction when ready.";
name.scrollIntoView({behavior:"smooth",block:"center"});
});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();