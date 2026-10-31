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
const intentRules=[
 ["campaigns.html",/concert|festival|fundrais|campaign|event|market day|craft fair|gathering|ticket|organize a fair/i],
 ["communities.html",/community|club|group|association|discussion|chat room|shared interest|network of friends/i],
 ["my-network.html",/collaborat|find partners|team up|cofound|co-found|connect with people|work together/i],
 ["network.html",/discover|search for|find people|find organizations|look for|who can help/i],
 ["growth.html",/promot|advertis|outreach|marketing|grow my|attract customers|spread the word/i],
 ["members.html",/list my|publish a listing|offer my service|announce my|share a listing/i],
 ["sports-district.html",/sports district|school athletics|sports league|athlete|school teams/i],
 ["request-build.html",/hire someone|request a custom|done for me|build it for me/i],
 ["builder.html",/website|webpage|storefront|online shop|create a site|build a site|portfolio/i]
];
function suggest(text){
 const matches=intentRules.filter(([,pattern])=>pattern.test(text));
 return matches.length===1?matches[0][0]:null;
}
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
 const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="Let SHANE choose the next step";select.append(placeholder);
 for(const [path,label] of targets){const option=document.createElement("option");option.value=path;option.textContent=label;select.append(option)}
 const button=document.createElement("button");button.type="button";button.textContent="Continue";
 const status=document.createElement("span");status.setAttribute("role","status");status.className="shane-action-status";
 const suggestion=document.createElement("span");suggestion.className="shane-action-suggestion";suggestion.setAttribute("aria-live","polite");
 const update=()=>{const text=idea(),destination=suggest(text),label=targets.find(([path])=>path===destination)?.[1];suggestion.textContent=select.value?"You chose "+targets.find(([path])=>path===select.value)?.[1]:label?"SHANE suggests: "+label:"Describe your idea and SHANE will suggest a next step."};
 select.addEventListener("change",update);
 document.addEventListener("input",event=>{if(event.target?.id&&(fields[location.pathname.split("/").pop()||"index.html"]||[]).includes(event.target.id))update()});
 button.addEventListener("click",async()=>{
  const text=idea();if(!text){status.textContent="Describe your idea on this page first.";return}
  const destination=select.value||suggest(text);
  if(!destination){status.textContent="Your idea spans several possibilities. Choose where to begin.";select.focus();return}
  let endeavorId=null;
  try{const value=window.SHANECurrentEndeavor?.read?.();if(typeof value==="string")endeavorId=value}catch{}
  try{
   sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:text.slice(0,4000),endeavorId,created:Date.now()}));
   if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:text.slice(0,4000),created:Date.now()}));
  }catch{status.textContent="Unable to carry the idea in this browser.";return}
  if(window.SHANEConversationStore&&window.SHANEConversation){
   try{
    window.SHANEConversation.remember(text,"endeavor-transition");
    await window.SHANEConversationStore.flush();
   }catch(error){status.textContent="Your idea is carried to the next page, but account history could not be confirmed."}
  }
  location.assign(destination);
 });
 group.append(select,button,suggestion,status);nav.append(group);update();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();