/* Dashboard conversation resume: use saved history when available, never publish automatically. */
(()=>{"use strict";
async function init(){
 const label=document.getElementById("shaneJourneyLatest"),create=document.getElementById("shaneJourneyCreate"),discover=document.getElementById("shaneJourneyDiscover");
 if(!label||!create||!discover)return;
 let entry=null;
 try{
  for(let i=0;i<20&&!window.SHANEConversationStore;i++)await new Promise(resolve=>setTimeout(resolve,150));
  if(window.SHANEConversationStore){
   const rows=await window.SHANEConversationStore.list({limit:1});
   if(rows.length)entry={text:rows[0].body,endeavorId:rows[0].endeavor_id};
  }
 }catch{label.textContent="Your saved history will appear here when you sign in."}
 if(!entry){
  const recent=window.SHANEConversation?.last();
  if(recent)entry={text:recent.text,endeavorId:null};
 }
 if(!entry){if(!label.textContent.includes("sign in"))label.textContent="Describe a new idea above or open your conversation history.";return}
 label.textContent="Most recent idea: "+entry.text.slice(0,240)+(entry.text.length>240?"…":"");
 for(const link of [create,discover])link.addEventListener("click",()=>{
  const destination=link.getAttribute("href").split("#")[0];
  try{
   if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:entry.text,created:Date.now()}));
   else sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:entry.text,endeavorId:entry.endeavorId,created:Date.now()}));
  }catch{}
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>void init(),{once:true});else void init();
})();