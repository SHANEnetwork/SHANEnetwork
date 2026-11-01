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
 const button=document.getElementById(drafts[page]);if(!button)return;
 const field=document.getElementById(event.detail.field);
 if(!field||!field.value.trim())return;
 // Discovery forms search public information; they do not publish, invite, or contact members.
 // For these pages run their existing search handler, while creation pages only prepare drafts.
 if(button.tagName==="FORM")return; // Never submit an existing form on arrival without an explicit member action.
 else if(!button.disabled&&button.dataset.shaneSafeDraft==="true")queueMicrotask(()=>button.click());
}
// Carry the person's intent into existing creation forms, without replacing edits
// or automatically publishing, messaging, inviting, or changing permissions.
const supportingFields={
 "communities.html":["description"],
 "campaigns.html":["description"],
 "workspace.html":["taskDetails","sharedPurpose"],
 "sports-district.html":["organizationDescription","description"],
 "members.html":["listingDescription","description"],
 "growth.html":["purpose"],
 "request-build.html":["details"],
 "my-network.html":["visionInput"]
};
function useVisionContext(event){
 const context=event.detail||{},page=location.pathname.split("/").pop();
 if(context.page!==page||typeof context.vision!=="string"||!context.vision.trim())return;
 const sourceField={ "communities.html":"communityIdea","campaigns.html":"campaignIdea","workspace.html":"taskIdea","members.html":"listingIdea","growth.html":"shaneGrowthGoal","request-build.html":"shaneBuildRequestGoal","my-network.html":"visionInput","sports-district.html":"shaneSportsGoal" }[page];
 const vision=(document.getElementById(sourceField)?.value?.trim()||context.vision.trim()).slice(0,4000);
 for(const id of supportingFields[page]||[]){
  const field=document.getElementById(id);
  if(!field||typeof field.value!=="string"||field.value.trim()||field.disabled||field.readOnly)continue;
  field.value=vision.slice(0,field.maxLength>0?field.maxLength:4000);
  field.dispatchEvent(new Event("input",{bubbles:true}));
  break;
 }
}
document.addEventListener("shane:vision-context-ready",useVisionContext);
document.addEventListener("shane:endeavor-arrived",prepare);
})();