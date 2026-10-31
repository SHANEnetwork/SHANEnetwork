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
 if(button.tagName==="FORM")queueMicrotask(()=>button.requestSubmit());
 else if(!button.disabled)queueMicrotask(()=>button.click());
}
document.addEventListener("shane:endeavor-arrived",prepare);
})();