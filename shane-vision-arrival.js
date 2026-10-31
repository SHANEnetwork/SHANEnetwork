/* Receive a person's existing endeavor on SHANE creation pages without overwriting edits.
   This is a temporary navigation bridge, not durable account history or an AI service. */
(()=>{"use strict";
const destinations={
 "communities.html":{field:"communityIdea",status:"communityDraftStatus"},
 "campaigns.html":{field:"campaignIdea",status:"campaignDraftStatus"},
 "members.html":{field:"listingIdea",status:"listingDraftStatus"},
 "growth.html":{field:"shaneGrowthGoal",status:"shaneGrowthReply"}
};
function init(){
 const page=location.pathname.split("/").pop(),target=destinations[page];if(!target)return;
 const field=document.getElementById(target.field);if(!field)return;
 let item;
 try{item=JSON.parse(sessionStorage.getItem("shane-intent-handoff-v1")||"null")}catch{return}
 if(!item||item.destination!==page||typeof item.text!=="string"||!item.text.trim()||!Number.isFinite(item.created)||Date.now()-item.created>86400000)return;
 if(field.value.trim())return;
 field.value=item.text.slice(0,field.maxLength>0?field.maxLength:4000);
 field.dispatchEvent(new Event("input",{bubbles:true}));
 const status=document.getElementById(target.status);
 if(status)status.textContent="Your idea has arrived from the SHANE Network. Review or refine it, then prepare your draft when ready.";
 try{sessionStorage.removeItem("shane-intent-handoff-v1")}catch{}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();