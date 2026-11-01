/* Receive a person's existing endeavor on SHANE creation pages without overwriting edits.
   This is a temporary navigation bridge, not durable account history or an AI service. */
(()=>{"use strict";
const destinations={
 "network.html":{field:"shaneDiscoveryWish",status:"shaneDiscoveryReply"},
 "workspace.html":{field:"taskIdea",status:"taskDraftStatus"},
 "my-network.html":{field:"visionInput",status:"visionMatches"},
 "builder.html":{field:"visionPrompt"},
 "communities.html":{field:"communityIdea",status:"communityDraftStatus"},
 "campaigns.html":{field:"campaignIdea",status:"campaignDraftStatus"},
 "members.html":{field:"listingIdea",status:"listingDraftStatus"},
 "growth.html":{field:"shaneGrowthGoal",status:"shaneGrowthReply"},
 "request-build.html":{field:"shaneBuildRequestGoal",status:"shaneBuildRequestReply"},
 "sports-district.html":{field:"shaneSportsGoal",status:"shaneSportsResponse"},
 "dashboard.html":{field:"goalInput",status:"goalHint"},
 "payments.html":{field:"paymentVision",status:"paymentResponse"},
 "community-feed.html":{field:"communityUpdateIdea",status:"communityUpdateDraftStatus"},
 "community-conversations.html":{field:"shaneCommunityIdea",status:"shaneCommunityReply"},
 "community-opportunities.html":{field:"opportunityIdea",status:"opportunityReply"},
 "contact.html":{field:"shaneSupportIdea",status:"shaneSupportResponse"},
 "system-health.html":{field:"shaneSupportIdea",status:"shaneSupportResponse",private:true}
};
async function offerAccountResume(page,target,field){
 if(field.value.trim())return;
 let active;try{active=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")}catch{return}
 if(!active||typeof active.id!=="string"||!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(active.id))return;
 const container=field.closest(".shane-conversation-intake")||field.parentElement;if(!container)return;
 if(container.querySelector(".shane-account-resume-choice"))return;
 const button=document.createElement("button");button.type="button";button.className="shane-resume-endeavor shane-account-resume-choice";button.textContent="Continue my saved endeavor here";
 const note=document.createElement("span");note.setAttribute("role","status");note.setAttribute("aria-live","polite");
 button.addEventListener("click",async()=>{
  if(field.value.trim()){note.textContent="Your current writing is preserved. Clear it before restoring another idea.";return}
  button.disabled=true;note.textContent="Opening your saved endeavor…";
  try{
   for(let n=0;n<25&&!window.SHANEConversationStore;n++)await new Promise(resolve=>setTimeout(resolve,120));
   const store=window.SHANEConversationStore;if(!store)throw Error("Conversation history is not available on this page.");
   const rows=await store.list({endeavorId:active.id,limit:100});
   const chosen=rows.find(row=>typeof row.body==="string"&&row.body.trim()&&(row.entry_kind==="idea"||row.entry_kind==="vision"||String(row.entry_kind||"").endsWith("-vision")))||rows.find(row=>typeof row.body==="string"&&row.body.trim()&&!["endeavor-transition","endeavor-plan"].includes(row.entry_kind));
   if(!chosen)throw Error("No saved conversation was found for this endeavor.");
   // Account selection may have changed while history was loading.
   const selected=window.SHANECurrentEndeavor?.read?.()||null;
   if(selected&&selected!==active.id)throw Error("The selected endeavor changed. Choose the project again before resuming.");
   if(field.value.trim())throw Error("This field changed while loading. Your new writing has been preserved.");
   field.value=chosen.body.slice(0,field.maxLength>0?field.maxLength:4000);field.dispatchEvent(new Event("input",{bubbles:true}));
   note.textContent="Your saved idea is ready. Review and refine it before creating anything.";
   try{sessionStorage.setItem("shane-active-endeavor-v1",JSON.stringify({id:active.id,updated:Date.now()}))}catch{}
   document.dispatchEvent(new CustomEvent("shane:endeavor-arrived",{detail:{page,endeavorId:active.id,field:target.field,source:"account"}}));
   Promise.resolve(window.SHANEConversation?.visionContext?.()).then(context=>{if(context)document.dispatchEvent(new CustomEvent("shane:vision-context-ready",{detail:{...context,vision:field.value.trim(),page}}))}).catch(()=>{});
   button.remove();
  }catch(error){note.textContent=String(error?.message||error);button.disabled=false}
 });
 container.append(button,note);
}
function enableInPlaceConversation(page,target,field){
 const container=field.closest(".shane-conversation-intake")||field.parentElement;
 if(!container||container.querySelector(".shane-use-conversation-here"))return;
 const button=document.createElement("button");button.type="button";
 button.className="shane-resume-endeavor shane-use-conversation-here";
 button.textContent="Use our current conversation here";
 const note=document.createElement("span");note.setAttribute("role","status");
 button.addEventListener("click",()=>{
  const source=document.getElementById("shane-shared-vision-input");
  const vision=source?.value?.trim()||window.SHANEConversation?.currentVision?.()||"";
  if(!vision){note.textContent="Describe your idea in the shared SHANE conversation first.";source?.focus();return}
  if(field.value.trim()&&field.value.trim()!==vision&&!confirm("Replace this field with your current SHANE conversation?"))return;
  field.value=vision.slice(0,field.maxLength>0?field.maxLength:4000);
  field.dispatchEvent(new Event("input",{bubbles:true}));
  note.textContent="Your conversation is ready in this workspace. Review and refine it before proceeding.";
  const prepareIds={
   "campaigns.html":"campaignDraft",
   "communities.html":"communityDraft",
   "growth.html":"shaneGrowthPrepare",
   "community-feed.html":"communityUpdatePrepare",
   "community-opportunities.html":"opportunityPrepare",
   "community-conversations.html":"shaneCommunityPrepare",
   "members.html":"listingDraft",
   "request-build.html":"shaneBuildRequestPrepare"
  };
  const prepare=document.getElementById(prepareIds[page]);
  if(prepare&&!prepare.disabled){
   // Existing preparation handlers create editable drafts only. Never submit forms,
   // publish, invite, send messages, or authorize a payment through this bridge.
   prepare.click();
   note.textContent="SHANE has passed your conversation to this workspace's draft preparation. Review the result before taking any action.";
  }
  document.dispatchEvent(new CustomEvent("shane:endeavor-arrived",{detail:{page,endeavorId:window.SHANECurrentEndeavor?.read?.()||null,field:target.field,source:"conversation"}}));
 });
 container.append(button,note);
}
function init(){
 const page=location.pathname.split("/").pop(),target=destinations[page];if(!target)return;
 const field=document.getElementById(target.field);if(!field)return;
 if(!target.private)enableInPlaceConversation(page,target,field);
 if(target.private){try{sessionStorage.removeItem("shane-intent-handoff-v1")}catch{}return} // Do not import general creative visions into confidential incident reports.
 // Apply the arriving endeavor identity before resolving per-endeavor drafts.
 try{const handoff=JSON.parse(sessionStorage.getItem("shane-intent-handoff-v1")||"null");if(handoff?.destination===page&&Number.isFinite(handoff.created)&&Date.now()-handoff.created>=0&&Date.now()-handoff.created<86400000&&typeof handoff.endeavorId==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(handoff.endeavorId))sessionStorage.setItem("shane-active-endeavor-v1",JSON.stringify({id:handoff.endeavorId,updated:Date.now()}))}catch{}
 let item;
 try{item=JSON.parse(sessionStorage.getItem("shane-intent-handoff-v1")||"null")}catch{return}
 if(!item||item.destination!==page||typeof item.text!=="string"||!item.text.trim()||!Number.isFinite(item.created)||Date.now()-item.created<0||Date.now()-item.created>86400000){offerAccountResume(page,target,field);return;}
 if(field.value.trim()){
  const container=field.closest(".shane-conversation-intake")||field.parentElement;
  if(container&&!container.querySelector(".shane-incoming-idea-choice")){const restore=document.createElement("button");restore.type="button";restore.className="shane-resume-endeavor shane-incoming-idea-choice";restore.textContent="Use incoming idea instead";restore.addEventListener("click",()=>{
   if(field.value.trim()&&!confirm("Replace the writing in this field with the incoming idea?"))return;
   field.value="";restore.remove();init();
  });container.append(restore)}
  return;
 }
 field.value=item.text.slice(0,field.maxLength>0?field.maxLength:4000);
 field.dispatchEvent(new Event("input",{bubbles:true}));
 if(item.endeavorId&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(item.endeavorId)){
  try{sessionStorage.setItem("shane-active-endeavor-v1",JSON.stringify({id:item.endeavorId,updated:Date.now()}))}catch{}
 }
 const status=document.getElementById(target.status);
 if(status&&page!=="my-network.html")status.textContent="Your idea has arrived from the SHANE Network. Review or refine it when ready.";
 try{sessionStorage.removeItem("shane-intent-handoff-v1")}catch{}
 document.dispatchEvent(new CustomEvent("shane:endeavor-arrived",{detail:{page,endeavorId:item.endeavorId||null,field:target.field}}));
 Promise.resolve(window.SHANEConversation?.visionContext?.()).then(context=>{if(context)document.dispatchEvent(new CustomEvent("shane:vision-context-ready",{detail:{...context,vision:field.value.trim(),page}}))}).catch(()=>{});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();