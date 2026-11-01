/* Draft collaborative tasks from ordinary language, preserving private messaging and task submission. */
(()=>{"use strict";
function init(){
 const idea=document.getElementById("taskIdea"),button=document.getElementById("taskDraft"),status=document.getElementById("taskDraftStatus");
 const title=document.getElementById("taskTitle"),details=document.getElementById("taskDetails");
 if(!idea||!button||!title||!details)return;
 button.addEventListener("click",()=>{
  const text=idea.value.trim();
  if(!text){status.textContent="Describe the next step you want to take together.";idea.focus();return}
  const first=text.split(/[.!?\n]/).map(part=>part.trim()).find(Boolean)||text;
  if(!title.value.trim())title.value=first.slice(0,240);
  if(!details.value.trim())details.value=text.slice(0,4000);
  const due=document.getElementById("taskDue");
  const match=text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if(due&&match&&!due.value){const candidate=match[0];if(!Number.isNaN(Date.parse(candidate)))due.value=candidate}
  status.textContent="Your shared task is ready for review. Choose a responsible person and date if needed, then add it when you agree.";
  document.getElementById("taskForm")?.scrollIntoView({behavior:"smooth",block:"start"});
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

/* AI-first enhancement: preserve existing manual drafting as offline fallback. */
(async()=>{
 await import("./shane-conversation-store.js");
 const trigger=document.getElementById("taskDraft"),idea=document.getElementById("taskIdea"),status=document.getElementById("taskDraftStatus");
 if(!trigger||!idea||!status)return;
 trigger.addEventListener("click",async event=>{
  const vision=idea.value.trim();
  if(vision.length<8)return;
  if(!window.SHANEConversationStore?.interpretVision)return;
  event.stopImmediatePropagation();
  trigger.disabled=true;status.textContent="SHANE is interpreting your vision into an editable creation.";
  try{
   const draft=await window.SHANEConversationStore.interpretVision({capability:"task",vision});
   const fields={"title":"taskTitle","details":"taskDetails"};
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
