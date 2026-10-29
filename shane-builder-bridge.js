/* SHANE builder bridge: reuse existing network links, never imply private provisioning. */
(function(){
"use strict";
const mapping=[
  {id:"shaneModuleCommunity",patterns:/\b(community|communities|club|association|members?|membership|league)\b/i},
  {id:"shaneModuleConversation",patterns:/\b(chat|conversation|discussion|forum|talk|collaborat|messag)/i},
  {id:"shaneModuleEvents",patterns:/\b(events?|conferences?|festival|meetups?|workshops?|tournaments?)\b/i},
  {id:"shaneModuleDiscovery",patterns:/\b(discover|partners?|opportunities|network|connections?|find people|research)\b/i}
];
function suggest(text){
  return mapping.filter(m=>m.patterns.test(String(text||""))).map(m=>m.id);
}
function apply(text){
  const selected=suggest(text);
  for(const item of mapping){
    const input=document.getElementById(item.id);
    if(input)input.checked=selected.includes(item.id);
  }
  const status=document.getElementById("shaneModuleStatus");
  if(status)status.textContent=selected.length
    ? "SHANE selected "+selected.length+" relevant network link(s) from your vision. These are links to existing SHANE services, not private services created for your endeavor."
    : "No network links inferred. SHANE will begin with your website draft.";
  return selected;
}
document.addEventListener("DOMContentLoaded",()=>{
  const action=document.getElementById("visionGuide");
  if(action)action.addEventListener("click",()=>{
    const input=document.getElementById("visionPrompt");
    if(input&&input.value.trim())apply(input.value);
  },{capture:true});
});
window.SHANEBuilderBridge=Object.freeze({suggest,apply});
})();
