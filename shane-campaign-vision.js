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