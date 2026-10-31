/* Shared endeavor actions inside existing navigation, not a new page or panel.
   Members can carry their current idea to any working SHANE capability. */
(()=>{"use strict";
const targets=[
 ["builder.html","Create a website"],
 ["network.html","Discover collaborators"],
 ["my-network.html","Build relationships"],
 ["members.html","Share a listing"],
 ["communities.html","Start a community"],
 ["campaigns.html","Organize a campaign"],
 ["growth.html","Plan outreach"],
 ["request-build.html","Request a custom build"],
 ["sports-district.html","Explore sports networks"]
];
const fields={
 "index.html":["welcomeIdea"],
 "builder.html":["visionPrompt","shaneIdeaReply"],
 "network.html":["shaneDiscoveryWish","q"],
 "my-network.html":["visionInput","query"],
 "members.html":["listingIdea","shaneMemberWelcome"],
 "communities.html":["communityIdea"],
 "campaigns.html":["campaignIdea"],
 "growth.html":["shaneGrowthGoal"],
 "request-build.html":["shaneBuildRequestGoal"],
 "sports-district.html":["shaneSportsGoal"],
 "workspace.html":["taskIdea","sharedPurpose"],
 "dashboard.html":["goalInput"]
};
function idea(){
 const page=location.pathname.split("/").pop()||"index.html";
 for(const id of fields[page]||[]){
  const node=document.getElementById(id);
  if(node&&typeof node.value==="string"&&node.value.trim())return node.value.trim();
 }
 const previous=window.SHANEConversation?.last?.();
 return typeof previous?.text==="string"?previous.text.trim():"";
}
function init(){
 const nav=document.querySelector(".shane-unified-nav");if(!nav)return;
 const group=document.createElement("span");group.className="shane-endeavor-actions";
 const select=document.createElement("select");select.setAttribute("aria-label","Choose what SHANE should do with this idea");
 const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="Take my idea to…";select.append(placeholder);
 for(const [path,label] of targets){const option=document.createElement("option");option.value=path;option.textContent=label;select.append(option)}
 const button=document.createElement("button");button.type="button";button.textContent="Continue";
 const status=document.createElement("span");status.setAttribute("role","status");status.className="shane-action-status";
 button.addEventListener("click",()=>{
  const destination=select.value;if(!destination){status.textContent="Choose where to continue.";select.focus();return}
  const text=idea();if(!text){status.textContent="Describe your idea on this page first.";return}
  let endeavorId=null;
  try{const value=window.SHANECurrentEndeavor?.read?.();if(typeof value==="string")endeavorId=value}catch{}
  try{
   sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:text.slice(0,4000),endeavorId,created:Date.now()}));
   if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:text.slice(0,4000),created:Date.now()}));
  }catch{status.textContent="Unable to carry the idea in this browser.";return}
  location.assign(destination);
 });
 group.append(select,button,status);nav.append(group);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();