/* Turn a carried idea into an editable draft on supported SHANE pages.
   Existing creation controls remain the authority for final saving or publishing. */
(()=>{"use strict";
const drafts={
 "communities.html":"communityDraft",
 "network.html":"shaneDiscoveryConversation",
 "my-network.html":"visionForm",
 "workspace.html":"taskDraft",
 "campaigns.html":"campaignDraft",
 "members.html":"listingDraft",
 "growth.html":"shaneGrowthPrepare",
 "request-build.html":"shaneBuildRequestPrepare",
 "sports-district.html":"shaneSportsPrepare"
};
function prepare(event){
 const page=location.pathname.split("/").pop();
 if(event?.detail?.page!==page)return;
 const field=document.getElementById(event.detail.field);
 if(!field||!field.value.trim())return;
 // The existing creation action remains user-controlled. Preparing an arrival
 // never triggers a submit, invitation, publication, or external search.
 const button=document.getElementById(drafts[page]);
 if(!button||button.disabled)return;
 document.dispatchEvent(new CustomEvent("shane:vision-arrival-ready",{
  detail:{page,field:event.detail.field,endeavorId:event.detail.endeavorId||null}
 }));
}
// Interpret an arriving vision into the existing forms, never into a new setup panel.
// Draft only: no publishing, messages, invitations, or automatic form submission.
const pageFields={
 "communities.html":{body:["description"],title:["name"]},
 "campaigns.html":{body:["description"],title:["title"]},
 "workspace.html":{body:["taskDetails","sharedPurpose"],title:["taskTitle"],next:["sharedNext"]},
 "members.html":{body:["listingDescription","description"],title:["listingTitle"]},
 "growth.html":{body:["purpose"],title:["project"]},
 "request-build.html":{body:["details"],title:["project"]},
 "sports-district.html":{body:["organizationDescription","description"],title:["organizationName"]},
 "my-network.html":{body:["visionInput"]},
 "network.html":{body:["shaneDiscoveryWish"]},
 "builder.html":{body:["visionPrompt"]},
 "dashboard.html":{body:["goalInput"]},
 "conversation-history.html":{body:[]},
 "community-conversations.html":{body:[]},
 "community-feed.html":{body:[]},
 "community-opportunities.html":{body:[]},
 "contact.html":{body:[]}
};
const sourceFields={
 "communities.html":"communityIdea","campaigns.html":"campaignIdea",
 "workspace.html":"taskIdea","members.html":"listingIdea",
 "growth.html":"shaneGrowthGoal","request-build.html":"shaneBuildRequestGoal",
 "my-network.html":"visionInput","sports-district.html":"shaneSportsGoal",
 "network.html":"shaneDiscoveryWish","builder.html":"visionPrompt","dashboard.html":"goalInput"
};
function fillEmpty(ids,value){
 if(!value)return false;
 for(const id of ids||[]){
  const field=document.getElementById(id);
  if(!field||typeof field.value!=="string"||field.value.trim()||field.disabled||field.readOnly)continue;
  if(field.tagName!=="INPUT"&&field.tagName!=="TEXTAREA")continue;
  const text=value.slice(0,field.maxLength>0?field.maxLength:4000);
  if(field.minLength>0&&text.length<field.minLength)continue;
  field.value=text;
  field.dispatchEvent(new Event("input",{bubbles:true}));
  field.dispatchEvent(new Event("change",{bubbles:true}));
  return true;
 }
 return false;
}
function extractTitle(vision){
 const first=vision.split(/[.!?\n]/)[0].trim()
  .replace(/^(?:i(?:'d| would)? like to|i want to|we(?:'d| would)? like to|we want to|please|help me|let's)\s+/i,"")
  .replace(/^(?:create|build|make|start|organize|launch|set up|plan)\s+/i,"");
 return first.replace(/\s+/g," ").slice(0,120);
}
// Extract only details that were actually expressed; never invent dates or contacts.
function inferDetails(vision,page){
 const result={};
 const place=vision.match(/\b(?:in|at|near)\s+([A-Z][\w .-]{2,45})(?=[,.;!]|\s+(?:on|for|with)\b|$)/);
 if(page==="campaigns.html"&&place)result.location=place[1].trim();
 if(page==="growth.html"){
  const ask=vision.match(/\b(?:looking for|seeking|need|want to find)\s+([^.!?\n]{5,180})/i);
  if(ask)result.ask=ask[1].trim();
  const website=vision.match(/https?:\/\/[^\s<>"']+/i);
  if(website)result.url=website[0].replace(/[.,;!?]+$/,"");
 }
 if(page==="workspace.html"){
  const task=vision.match(/\b(?:first|next|start by|need to)\s+([^.!?\n]{5,180})/i);
  if(task)result.sharedNext=task[1].trim();
 }
 if(page==="communities.html"){
  const named=vision.match(/\b(?:community|group|club)\s+(?:called|named)\s+["“]?([^"”.,!?\n]{3,90})/i);
  if(named)result.name=named[1].trim();
 }
 if(page==="campaigns.html"){
  const named=vision.match(/\b(?:campaign|event|fundraiser)\s+(?:called|named)\s+["“]?([^"”.,!?\n]{3,90})/i);
  if(named)result.title=named[1].trim();
 }
 if(page==="request-build.html"){
  const budget=vision.match(/\b(?:budget|spend|funding)\s*(?:is|of|around|about|:)?\s*(\$[\d,]+(?:\.\d{2})?)/i);
  if(budget)result.budget=budget[1];
 }
 return result;
}
function useVisionContext(event){
 const context=event.detail||{},page=location.pathname.split("/").pop();
 const spec=pageFields[page];
 if(!spec||context.page!==page)return;
 const incoming=document.getElementById(sourceFields[page])?.value?.trim();
 const vision=String(incoming||context.vision||"").trim().slice(0,4000);
 if(!vision)return;
 // Do not replay a stale event from another selected endeavor.
 const active=window.SHANECurrentEndeavor?.read?.()||null;
 if(context.endeavorId&&context.endeavorId!==active)return;
 fillEmpty(spec.body,vision);
 const details=inferDetails(vision,page);
 // Prefer a name the person explicitly supplied over a generated title.
 const explicitTitle=details.name||details.title||"";
 const title=explicitTitle||extractTitle(vision);
 if(title.length>=3)fillEmpty(spec.title,title);
 for(const [id,value] of Object.entries(details))fillEmpty([id],value);
 if(page==="workspace.html")fillEmpty(["sharedPurpose"],vision);
 if(page==="growth.html")fillEmpty(["purpose"],vision);
 if(page==="network.html")fillEmpty(["q"],extractTitle(vision));
 if(page==="dashboard.html")fillEmpty(["goalInput"],vision);
 if(page==="builder.html")fillEmpty(["visionPrompt"],vision);
 if(page==="members.html")fillEmpty(["listingDescription","description"],vision);
 if(page==="sports-district.html")fillEmpty(["organizationDescription","description"],vision);
 if(spec.next)fillEmpty(spec.next,"Identify the first shared action and agree who will take it.");
 // Keep the draft editable; downstream features can react to the prepared event.
 document.dispatchEvent(new CustomEvent("shane:vision-draft-prepared",{
  detail:{page,endeavorId:context.endeavorId||null}
 }));
}
document.addEventListener("shane:vision-context-ready",useVisionContext);
document.addEventListener("shane:endeavor-arrived",prepare);
})();