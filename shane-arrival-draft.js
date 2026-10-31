/* Turn a carried idea into an editable draft on supported SHANE pages.
   Existing creation controls remain the authority for final saving or publishing. */
(()=>{"use strict";
const drafts={
 "communities.html":"communityDraft",
 "campaigns.html":"campaignDraft",
 "members.html":"listingDraft",
 "growth.html":"shaneGrowthPrepare",
 "request-build.html":"shaneBuildRequestPrepare",
 "sports-district.html":"shaneSportsPrepare"
};
function prepare(event){
 const page=location.pathname.split("/").pop();
 if(event?.detail?.page!==page)return;
 const button=document.getElementById(drafts[page]);if(!button||button.disabled)return;
 const field=document.getElementById(event.detail.field);
 if(!field||!field.value.trim())return;
 // The existing prepare handlers fill editable fields; they do not submit.
 queueMicrotask(()=>button.click());
}
document.addEventListener("shane:endeavor-arrived",prepare);
})();