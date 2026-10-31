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
  const plan=window.SHANEVision?.interpret(text);
  const selected=plan?[
    ...(plan.spec.modules.some(m=>m.type==="memberships")?["shaneModuleCommunity"]:[]),
    ...(plan.spec.modules.some(m=>["messaging","discussions"].includes(m.type))?["shaneModuleConversation"]:[]),
    ...(plan.spec.modules.some(m=>m.type==="events")?["shaneModuleEvents"]:[]),
    ...(plan.spec.modules.some(m=>m.type==="discovery")?["shaneModuleDiscovery"]:[])
  ]:suggest(text);
  if(plan)window.SHANECurrentComposition=plan;
  // Suggestions never erase the member's existing manual choices.
  for(const item of mapping){
    const input=document.getElementById(item.id);
    if(input&&selected.includes(item.id))input.checked=true;
  }
  const status=document.getElementById("shaneModuleStatus");
  if(status)status.textContent=selected.length
    ? "SHANE suggested "+selected.length+" network capability link(s) from your vision. Your manual choices remain intact. These links do not create private services automatically."
    : "No network links inferred yet. SHANE can continue developing your endeavor without requiring a website.";
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
