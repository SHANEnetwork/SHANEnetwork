/* Prepare editable community settings from a member's description; never save automatically. */
(()=>{"use strict";
function init(){
 const idea=document.getElementById("communityIdea"),button=document.getElementById("communityDraft"),status=document.getElementById("communityDraftStatus");
 const name=document.getElementById("name"),description=document.getElementById("description"),category=document.getElementById("category");
 if(!idea||!button||!name||!description)return;
 button.addEventListener("click",()=>{
  const text=idea.value.trim();
  if(!text){status.textContent="Describe the community you want to create.";idea.focus();return}
  const first=text.split(/[.!?\n]/).map(s=>s.trim()).find(Boolean)||text;
  if(!name.value.trim())name.value=first.slice(0,120);
  if(!description.value.trim())description.value=text.slice(0,3000);
  const options=[...category.options];
  const match=options.find(option=>option.value!=="community"&&text.toLowerCase().includes(option.value.toLowerCase()));
  if(match)category.value=match.value;
  try{window.SHANEConversation?.remember(text,"community-vision")}catch{}
  status.textContent="Your community draft is ready. Review the name, membership, conversations and other settings before creating it.";
  document.getElementById("form")?.scrollIntoView({behavior:"smooth",block:"start"});
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();