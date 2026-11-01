/* Conversation-first campaign drafting. No automatic publishing or invented AI reply. */
(()=>{"use strict";
function init(){
 const idea=document.getElementById("campaignIdea"),draft=document.getElementById("campaignDraft"),status=document.getElementById("campaignDraftStatus");
 const title=document.getElementById("title"),description=document.getElementById("description"),category=document.getElementById("category");
 if(!idea||!draft||!title||!description)return;
 draft.addEventListener("click",()=>{
  const text=idea.value.trim();
  if(!text){status.textContent="Describe your idea to begin.";idea.focus();return}
  const first=text.split(/[.!?\n]/).map(s=>s.trim()).find(Boolean)||text;
  if(!title.value.trim())title.value=first.slice(0,160);
  if(!description.value.trim())description.value=text.slice(0,4000);
  const categories=[["concert",/concert|live music|band|musician/i],["fair",/fair|market|festival|craft/i],["conference",/conference|summit|workshop/i],["advertising",/advertis|promotion|marketing/i],["gathering",/gather|meetup|party|community|event/i]];
  const match=categories.find(([,pattern])=>pattern.test(text));
  if(match&&category)category.value=match[0];
  try{window.SHANEConversation?.remember(text,"campaign-vision")}catch{}
  status.textContent="Your campaign draft is ready below. Add a deadline and supporter target, then review before choosing whether to publish.";
  document.getElementById("create")?.scrollIntoView({behavior:"smooth",block:"start"});
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

/* AI-first enhancement: preserve existing manual drafting as offline fallback. */
(async()=>{
 await import("./shane-conversation-store.js");
 const trigger=document.getElementById("campaignDraft"),idea=document.getElementById("campaignIdea"),status=document.getElementById("campaignDraftStatus");
 if(!trigger||!idea||!status)return;
 trigger.addEventListener("click",async event=>{
  const vision=idea.value.trim();
  if(vision.length<8)return;
  if(!window.SHANEConversationStore?.interpretVision)return;
  event.stopImmediatePropagation();
  trigger.disabled=true;status.textContent="SHANE is interpreting your vision into an editable creation.";
  try{
   const draft=await window.SHANEConversationStore.interpretVision({capability:"campaign",vision});
   const fields={"title":"title","description":"description","category":"category","location":"location"};
   for(const [key,id] of Object.entries(fields)){
    const target=document.getElementById(id),value=draft[key];
    if(!target||typeof value!=="string"||!value.trim()||target.value.trim())continue;
    if(target.tagName==="SELECT"){
     const match=[...target.options].find(option=>option.value.toLowerCase()===value.toLowerCase());
     if(match)target.value=match.value;
    }else{target.value=value.slice(0,target.maxLength>0?target.maxLength:4000);target.dispatchEvent(new Event("input",{bubbles:true}));}
   }
   status.textContent="SHANE prepared your creation from the conversation. Review it before saving or publishing.";
  }catch(error){status.textContent="AI drafting unavailable: "+error.message+" Your original draft is preserved."}
  finally{trigger.disabled=false}
 },{capture:true});
})().catch(()=>{});


/* Explicit conversational creation keeps campaigns unpublished until the member chooses to publish. */
(()=>{
 const init=()=>{
 const trigger=document.getElementById("campaignDraft"),idea=document.getElementById("campaignIdea"),status=document.getElementById("campaignDraftStatus");
 if(!trigger||!idea||!status)return;
 const button=document.createElement("button");button.type="button";button.textContent="Save my campaign privately";trigger.insertAdjacentElement("afterend",button);
 button.addEventListener("click",async()=>{
  const vision=idea.value.trim();if(vision.length<8){status.textContent="Describe your campaign first.";return}
  button.disabled=true;status.textContent="SHANE is creating your private campaign draft.";
  try{
   await import("./shane-conversation-store.js");const store=window.SHANEConversationStore;
   const draft=await store.interpretVision({capability:"campaign",vision});
   const value=(id)=>document.getElementById(id)?.value||"";
   const title=value("title").trim()||draft.title||"";
   const description=value("description").trim()||draft.description||vision;
   const deadline=value("deadline");
   if(!deadline)throw Error("Set an interest deadline to save this campaign. Your vision remains here.");
   const result=await store.createPrivateCampaign({vision,title,description,category:value("category")||draft.category,location:value("location")||draft.location,deadline,minimumSupporters:value("minimum")||10,eventDate:value("eventDate")||null});
   status.textContent="Campaign saved privately as a draft. It has not been published or sent to anyone. Campaign ID: "+result.campaignId;
  }catch(error){status.textContent="Campaign not saved: "+error.message}
  finally{button.disabled=false}
 });
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
