/* Conversation-first listing draft; preserves the existing authorization and publication form. */
(()=>{"use strict";
function init(){
 const idea=document.getElementById("listingIdea"),button=document.getElementById("listingDraft"),status=document.getElementById("listingDraftStatus");
 const title=document.getElementById("title"),description=document.getElementById("description"),category=document.getElementById("category"),publication=document.getElementById("publication");
 if(!idea||!button||!title||!description)return;
 button.addEventListener("click",()=>{
  const text=idea.value.trim();
  if(!text){status.textContent="Describe what you want to share first.";idea.focus();return}
  const first=text.split(/[.!?\n]/).map(part=>part.trim()).find(Boolean)||text;
  if(!title.value.trim())title.value=first.slice(0,150);
  if(!description.value.trim())description.value=text;
  const matches=[["event",/event|festival|concert|gathering|meetup/i],["service",/service|consult|repair|teach|coaching/i],["organization",/organization|nonprofit|association|club/i],["opportunity",/opportunity|volunteer|recruit|hiring/i],["business",/shop|store|bakery|business|sell/i],["person",/my skills|my experience|freelance/i],["project",/project|research|build|invent/i]];
  const match=matches.find(([,pattern])=>pattern.test(text));
  if(match&&category)category.value=match[0];
  if(publication)publication.value="draft";
  try{window.SHANEConversation?.remember(text,"listing-vision")}catch{}
  status.textContent="Your listing draft is ready. Review it and confirm permission before choosing whether to publish.";
  document.getElementById("listing")?.scrollIntoView({behavior:"smooth",block:"start"});
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();