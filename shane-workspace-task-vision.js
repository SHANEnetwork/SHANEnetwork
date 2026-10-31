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