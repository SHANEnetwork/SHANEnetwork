/* Receive a person's existing endeavor on SHANE creation pages without overwriting edits.
   This is a temporary navigation bridge, not durable account history or an AI service. */
(()=>{"use strict";
const destinations={
 "network.html":{field:"shaneDiscoveryWish",status:"shaneDiscoveryReply"},
 "my-network.html":{field:"visionInput",status:"visionMatches"},
 "builder.html":{field:"visionPrompt"},
 "communities.html":{field:"communityIdea",status:"communityDraftStatus"},
 "campaigns.html":{field:"campaignIdea",status:"campaignDraftStatus"},
 "members.html":{field:"listingIdea",status:"listingDraftStatus"},
 "growth.html":{field:"shaneGrowthGoal",status:"shaneGrowthReply"},
 "request-build.html":{field:"shaneBuildRequestGoal",status:"shaneBuildRequestReply"},
 "sports-district.html":{field:"shaneSportsGoal",status:"shaneSportsResponse"}
};
async function offerAccountResume(page,target,field){
 if(field.value.trim())return;
 let active;try{active=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")}catch{return}
 if(!active||typeof active.id!=="string"||!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(active.id))return;
 const container=field.closest(".shane-conversation-intake")||field.parentElement;if(!container)return;
 const button=document.createElement("button");button.type="button";button.className="shane-resume-endeavor";button.textContent="Continue my saved endeavor here";
 const note=document.createElement("span");note.setAttribute("role","status");note.setAttribute("aria-live","polite");
 button.addEventListener("click",async()=>{
  if(field.value.trim()){note.textContent="Your current writing is preserved. Clear it before restoring another idea.";return}
  button.disabled=true;note.textContent="Opening your saved endeavor…";
  try{
   for(let n=0;n<25&&!window.SHANEConversationStore;n++)await new Promise(resolve=>setTimeout(resolve,120));
   const store=window.SHANEConversationStore;if(!store)throw Error("Conversation history is not available on this page.");
   const rows=await store.list({endeavorId:active.id,limit:30});
   const chosen=rows.find(row=>row.entry_kind==="idea"||row.entry_kind==="vision"||row.entry_kind.endsWith("-vision"))||rows[0];
   if(!chosen)throw Error("No saved conversation was found for this endeavor.");
   field.value=chosen.body.slice(0,field.maxLength>0?field.maxLength:4000);field.dispatchEvent(new Event("input",{bubbles:true}));
   note.textContent="Your saved idea is ready. Review and refine it before creating anything.";
   button.remove();
  }catch(error){note.textContent=String(error?.message||error);button.disabled=false}
 });
 container.append(button,note);
}
function init(){
 const page=location.pathname.split("/").pop(),target=destinations[page];if(!target)return;
 const field=document.getElementById(target.field);if(!field)return;
 let item;
 try{item=JSON.parse(sessionStorage.getItem("shane-intent-handoff-v1")||"null")}catch{return}
 if(!item||item.destination!==page||typeof item.text!=="string"||!item.text.trim()||!Number.isFinite(item.created)||Date.now()-item.created>86400000){offerAccountResume(page,target,field);return;}
 if(field.value.trim())return;
 field.value=item.text.slice(0,field.maxLength>0?field.maxLength:4000);
 field.dispatchEvent(new Event("input",{bubbles:true}));
 const status=document.getElementById(target.status);
 if(status&&page!=="my-network.html")status.textContent="Your idea has arrived from the SHANE Network. Review or refine it when ready.";
 try{sessionStorage.removeItem("shane-intent-handoff-v1")}catch{}
 document.dispatchEvent(new CustomEvent("shane:endeavor-arrived",{detail:{page,endeavorId:item.endeavorId||null,field:target.field}}));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();