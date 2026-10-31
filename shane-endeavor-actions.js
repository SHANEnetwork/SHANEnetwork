/* Shared endeavor actions inside existing navigation, not a new page or panel.
   Members can carry their current idea to any working SHANE capability. */
(()=>{"use strict";
const targets=[
 ["builder.html","Create a website"],
 ["dashboard.html","Review my endeavors"],
 ["conversation-history.html","Review conversation history"],
 ["network.html","Discover collaborators"],
 ["my-network.html","Build relationships"],
 ["workspace.html","Coordinate shared tasks"],
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
 ["dashboard.html",/my projects|my endeavors|my dashboard|what have i created/i],
 ["conversation-history.html",/conversation history|past conversations|previous ideas|what did we discuss/i],
 ["workspace.html",/assign a task|create a task|task list|work plan|project milestone|coordinate work|to.do list/i],
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
 // Existing SHANE navigation links also carry the current endeavor when a member
 // deliberately opens another creation or collaboration capability.
 nav.addEventListener("click",event=>{
  const link=event.target.closest?.("a[href]");
  if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin)return;
  const destination=url.pathname.split("/").pop();
  if(!targets.some(([path])=>path===destination))return;
  const text=idea();if(!text)return;
  let endeavorId=null;
  try{const saved=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;if(typeof saved==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(saved))endeavorId=saved}catch{}
  try{sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:text.slice(0,4000),endeavorId,created:Date.now()}))}catch{}
 });
 select.addEventListener("change",update);
 document.addEventListener("input",event=>{if(event.target?.id&&(fields[location.pathname.split("/").pop()||"index.html"]||[]).includes(event.target.id))update()});
 button.addEventListener("click",async()=>{
  let text=idea();
  if(!text&&window.SHANEConversationStore?.list){
   try{
    const active=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;
    if(!active||!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(active))throw Error("No selected endeavor");
    const entries=await window.SHANEConversationStore.list({endeavorId:active,limit:20});
    const preferred=entries.find(entry=>entry.entry_kind!=="endeavor-transition"&&typeof entry.body==="string"&&entry.body.trim());
    text=(preferred||entries.find(entry=>typeof entry.body==="string"&&entry.body.trim()))?.body?.trim()||"";
   }catch{}
  }
  if(!text){status.textContent="Describe your idea here or choose a saved endeavor to continue.";return}
  const destination=select.value||suggest(text);
  if(!destination){status.textContent="Your idea spans several possibilities. Choose where to begin.";select.focus();return}
  button.disabled=true;status.textContent="Carrying your endeavor forward…";
  let endeavorId=null;
  try{const value=window.SHANECurrentEndeavor?.read?.();if(typeof value==="string")endeavorId=value}catch{}
  if(!endeavorId){try{const saved=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;if(typeof saved==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(saved))endeavorId=saved}catch{}}
  try{
   sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:text.slice(0,4000),endeavorId,created:Date.now()}));
   if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:text.slice(0,4000),created:Date.now()}));
  }catch{status.textContent="Unable to carry the idea in this browser.";button.disabled=false;return}
  if(window.SHANEConversationStore?.saveTurn){
   try{
    const result=await window.SHANEConversationStore.saveTurn(text,{page:location.pathname.split("/").pop()||"index.html",kind:"endeavor-transition",endeavorId});
    if(!result.saved)status.textContent="Your idea will continue on the next page. Sign in to preserve it in account history.";
   }catch(error){status.textContent="Your idea is carried to the next page, but account history could not be confirmed."}
  }
  location.assign(destination);
 });
 group.append(select,button,suggestion,status);nav.append(group);update();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();