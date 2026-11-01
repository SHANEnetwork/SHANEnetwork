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
 ["sports-district.html","Explore sports networks"],
 ["payments.html","Plan how customers pay"],
 ["community-feed.html","Prepare a community update"],
 ["community-conversations.html","Discuss with my community"],
 ["community-opportunities.html","Coordinate volunteers and opportunities"],
 ["community-history.html","Review community changes and rollback"],
 ["community-members.html","Manage community members and roles"],
 ["appearance.html","Personalize SHANE appearance"],
 ["contact.html","Contact SHANE"],
 ["system-health.html","Report a technical problem"]
];
const intentRules=[
 ["campaigns.html",/concert|festival|fundrais|campaign|event|market day|craft fair|gathering|ticket|organize a fair/i],
 ["communities.html",/community|club|group|association|discussion|chat room|shared interest|network of friends/i],
 ["my-network.html",/collaborat|find partners|team up|cofound|co-found|connect with people|work together/i],
 ["dashboard.html",/my projects|my endeavors|my dashboard|what have i created/i],
 ["conversation-history.html",/conversation history|past conversations|previous ideas|what did we discuss/i],
 ["community-history.html",/restore community settings|rollback community|community configuration history|community version history/i],
 ["community-members.html",/community members|manage members|member roles|community permissions|moderate members/i],
 ["community-conversations.html",/community chat|community conversation|discussion room|chat room with members/i],
 ["community-feed.html",/community announcement|post an update|share community news|community feed/i],
 ["community-opportunities.html",/need volunteers|volunteer signup|community service opportunity|help wanted in my community/i],
 ["growth.html",/find customers|build an audience|increase visibility|promote our project|reach supporters/i],
 ["workspace.html",/divide responsibilities|track progress|plan our work|coordinate the team|project checklist/i],
 ["payments.html",/collect donations|sell products|receive contributions|online donations|payment links/i],
 ["appearance.html",/appearance settings|change theme|change colors|custom theme|my colors|font settings/i],
 ["workspace.html",/assign a task|create a task|task list|work plan|project milestone|coordinate work|to.do list|coordinate volunteers|organize responsibilities/i],
 ["network.html",/discover|search for|find people|find organizations|look for|who can help/i],
 ["growth.html",/promot|advertis|outreach|marketing|grow my|attract customers|spread the word|launch campaign awareness|reach more people/i],
 ["members.html",/list my|publish a listing|offer my service|announce my|share a listing/i],
 ["sports-district.html",/sports district|school athletics|sports league|athlete|school teams/i],
 ["request-build.html",/hire someone|request a custom|done for me|build it for me/i],
 ["payments.html",/accept payments|checkout|payment provider|take payments|pay online|sell tickets/i],
 ["community-opportunities.html",/volunteer opportunity|recruit volunteers|community opportunity|find volunteers|organize volunteers/i],
 ["system-health.html",/report a bug|report an error|technical incident|system problem|site crashed/i],
 ["contact.html",/contact shane|send a message to shane|contact support|ask shane team/i],
 ["builder.html",/website|webpage|storefront|online shop|create a site|build a site|portfolio|landing page|online presence/i],
 // Everyday descriptions should connect to the working network modules without
 // requiring members to know product names or configure a workflow first.
 ["builder.html",/bakery|baker|restaurant|food truck|cafe|small business|sell my|sell our|shop|boutique|craft business|artist portfolio|musician website|photography business|freelance business/i],
 ["campaigns.html",/wedding|reunion|meetup|workshop|class registration|conference|seminar|performance|recital|fundraising dinner|ticketed show|open house|farmers market/i],
 ["communities.html",/book club|parent group|neighborhood group|hobby group|fan club|church group|support group|alumni group|local chapter/i],
 ["community-conversations.html",/message board|discussion forum|group chat|member discussion|talk with members|conversation room/i],
 ["community-feed.html",/newsletter|bulletin|community updates|announce to members|news for members/i],
 ["community-opportunities.html",/volunteer shifts|sign up to help|volunteer roster|helpers needed|volunteer schedule/i],
 ["my-network.html",/find a collaborator|find a cofounder|find a partner|partner with|work with other|join forces|collaborative project/i],
 ["workspace.html",/organize our work|team tasks|project schedule|coordinate activities|shared checklist|to-do board|plan the project/i],
 ["payments.html",/sell subscriptions|membership dues|charge customers|collect fees|collect payments|paid registration|accept donations/i],
 ["growth.html",/get visitors|attract clients|find supporters|promote the launch|grow membership|reach an audience|find an audience/i],
 ["members.html",/directory listing|service directory|offer a room|offer a space|find a home|room and board|post a listing/i],
 ["sports-district.html",/sports team|youth league|school sports|athletic club|tournament|team schedule/i]
];
// A machine-readable capability contract for future model-driven orchestration.
// Only registered local destinations are allowed. Sensitive actions stay gated
// by the existing module's own authorization and explicit user confirmation.
const capabilityCatalog=Object.freeze(targets.filter(([path])=>path!=="system-health.html"&&path!=="contact.html").map(([path,label])=>Object.freeze({
 id:path.replace(/\.html$/,""),path,label,
 action:"prepare",execution:"requires-module",requiresConfirmation:true
})));
function interpretVision(text){
 const vision=String(text||"").trim();
 if(!vision)return {version:1,vision:"",capabilities:[],status:"needs-vision"};
 const capabilities=capabilityCatalog.filter(item=>intentRules.some(([path,pattern])=>path===item.path&&pattern.test(vision)));
 // A new, unfamiliar kind of endeavor still has a place to begin: SHANE's
 // conversational creator. The original vision remains unchanged.
 if(!capabilities.length){
  const startingPoint=capabilityCatalog.find(item=>item.path==="builder.html");
  if(startingPoint)capabilities.push(startingPoint);
 }
 return {version:1,vision,capabilities,preferredDestination:suggest(vision)||"builder.html",status:"proposed",execution:"not-started"};
}
// One controlled bridge for preparing existing module workflows. It never
// publishes, pays, messages, invites, or modifies third-party data.
function prepareCapability({capabilityId,vision,endeavorId=null}={}){
 const capability=capabilityCatalog.find(item=>item.id===capabilityId);
 if(!capability)return {ok:false,reason:"unknown-capability"};
 const text=String(vision||"").trim();
 if(!text)return {ok:false,reason:"empty-vision"};
 const selected=window.SHANECurrentEndeavor?.read?.()||null;
 if(endeavorId!==null&&endeavorId!==selected)return {ok:false,reason:"endeavor-mismatch"};
 if((location.pathname.split("/").pop())==="system-health.html")return {ok:false,reason:"private-page"};
 const payload={destination:capability.path,text,endeavorId:selected,created:Date.now()};
 try{
  sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify(payload));
  if(capability.path==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text,created:payload.created}));
  return {ok:true,destination:capability.path,requiresConfirmation:true,executed:false};
 }catch{return {ok:false,reason:"storage-unavailable"}}
}
// Turn a multi-part endeavor into an ordered journey using the existing
// capability catalog. Preparing a step is separate from executing it.
function journeyFor({vision,latestRequest="",endeavorId=null}={}){
 const purpose=String(vision||"").trim();
 const request=String(latestRequest||"").trim();
 const primary=interpretVision(request||purpose);
 const original=purpose&&request&&request!==purpose?interpretVision(purpose):null;
 const ordered=new Map();
 for(const item of primary.capabilities)ordered.set(item.id,item);
 for(const item of original?.capabilities||[])if(!ordered.has(item.id))ordered.set(item.id,item);
 return {
  version:1,endeavorId,purpose,latestRequest:request||purpose,
  steps:[...ordered.values()].map((item,index)=>({
   capabilityId:item.id,path:item.path,label:item.label,order:index+1,
   status:"proposed",requiresConfirmation:true
  })),
  preferredDestination:primary.preferredDestination,
  execution:"not-started"
 };
}
function prepareJourneyStep({journey,capabilityId}={}){
 if(!journey||!Array.isArray(journey.steps))return {ok:false,reason:"missing-journey"};
 const step=journey.steps.find(item=>item.capabilityId===capabilityId);
 if(!step||step.status!=="proposed")return {ok:false,reason:"unavailable-step"};
 if(!capabilityCatalog.some(item=>item.id===step.capabilityId&&item.path===step.path))
  return {ok:false,reason:"unknown-capability"};
 const selected=window.SHANECurrentEndeavor?.read?.()||null;
 if(journey.endeavorId&&journey.endeavorId!==selected)return {ok:false,reason:"endeavor-mismatch"};
 const vision=[journey.purpose,journey.latestRequest&&journey.latestRequest!==journey.purpose
  ?"Current refinement: "+journey.latestRequest:""].filter(Boolean).join("\n\n");
 const result=prepareCapability({capabilityId:step.capabilityId,vision,endeavorId:journey.endeavorId||null});
 if(result.ok){
  try{
   const payload=JSON.parse(sessionStorage.getItem("shane-intent-handoff-v1")||"null");
   if(payload?.destination===step.path){
    payload.context={purpose:journey.purpose,latestRequest:journey.latestRequest,
     steps:journey.steps.map(item=>({capabilityId:item.capabilityId,status:item.status}))};
    sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify(payload));
   }
  }catch{}
 }
 return result;
}
window.SHANECapabilities=Object.freeze({
 catalog:()=>capabilityCatalog.slice(),interpret:interpretVision,
 prepare:prepareCapability,journey:journeyFor,prepareJourneyStep
});
function suggest(text){
 // Interpret several goals together instead of failing whenever a vision mentions
 // both a website and the people, event, or community it is meant to serve.
 const value=String(text||"").trim();if(!value)return null;
 const matches=intentRules.filter(([,pattern])=>pattern.test(value));
 if(matches.length===1)return matches[0][0];
 if(!matches.length)return null;
 const priorities=[
  ["community-history.html",/\b(restore community settings|rollback community|community configuration history|community version history)\b/i],
  ["appearance.html",/\b(appearance settings|change theme|change colors|custom theme|my colors|font settings)\b/i],
  ["request-build.html",/\b(hire|done for me|build it for me|custom build)\b/i],
  ["payments.html",/\b(accept payments|take payments|checkout|payment provider|pay online|sell tickets)\b/i],
  ["community-opportunities.html",/\b(recruit volunteers|volunteer opportunity|find volunteers|community opportunity)\b/i],
  ["workspace.html",/\b(assign|task|responsibilit|milestone|coordinate volunteers)\b/i],
  ["campaigns.html",/\b(organize|host|plan|launch|schedule)\b.{0,55}\b(event|festival|concert|fair|campaign)\b/i],
  ["communities.html",/\b(start|create|form|organize)\b.{0,45}\b(community|club|group|association)\b/i],
  ["my-network.html",/\b(find|meet|invite|connect|collaborate)\b.{0,55}\b(partners|collaborators|people|team)\b/i],
  ["growth.html",/\b(promote|market|advertise|grow|reach)\b/i],
  ["builder.html",/\b(build|create|design|make|revise)\b.{0,45}\b(website|site|page|storefront|portfolio)\b/i],
  ["campaigns.html",/\b(wedding|reunion|meetup|workshop|conference|performance|recital|open house|farmers market)\b/i],
  ["communities.html",/\b(book club|parent group|neighborhood group|fan club|church group|alumni group)\b/i],
  ["payments.html",/\b(membership dues|collect fees|charge customers|paid registration|accept donations)\b/i]
 ];
 for(const [destination,pattern] of priorities)if(matches.some(([path])=>path===destination)&&pattern.test(value))return destination;
 // A multi-goal endeavor should still have a useful first step.
 // Begin with the creator when the vision includes a website; otherwise choose
 // the earliest relevant collaboration or organization capability.
 const preferred=["builder.html","communities.html","campaigns.html","workspace.html","my-network.html","network.html","growth.html","members.html"];
 return preferred.find(path=>matches.some(([matched])=>matched===path))||matches[0][0];
}
const conversationKey="shane-shared-idea-draft-v2";
const activeDraftKey=()=>{
 const id=window.SHANECurrentEndeavor?.read?.();
 return conversationKey+":"+(typeof id==="string"&&/^[0-9a-f-]{36}$/i.test(id)?id:"personal");
};
const readDraft=()=>{try{return String(sessionStorage.getItem(activeDraftKey())||"")}catch{return ""}};
const writeDraft=value=>{try{sessionStorage.setItem(activeDraftKey(),String(value||""))}catch{}};

function sharedComposerText(){
 const node=document.getElementById("shane-shared-vision-input");
 return node&&typeof node.value==="string"?node.value.trim():"";
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
 "dashboard.html":["goalInput"],
 "payments.html":["paymentVision"],
 "community-feed.html":["communityUpdateIdea"],
 "community-conversations.html":["shaneCommunityIdea"],
 "community-opportunities.html":["opportunityIdea"],
 "contact.html":["shaneSupportIdea"],
 "system-health.html":["shaneSupportIdea"]
};
function idea(){
 const page=location.pathname.split("/").pop()||"index.html";
 if(page!=="system-health.html"&&page!=="contact.html"&&sharedComposerText())return sharedComposerText();
 for(const id of fields[page]||[]){
  const node=document.getElementById(id);
  if(node&&typeof node.value==="string"&&node.value.trim())return node.value.trim();
 }
 const shared=window.SHANEConversation?.currentVision?.();
 if(typeof shared==="string"&&shared.trim())return shared.trim();
 const selected=window.SHANECurrentEndeavor?.read?.()||null;
 const turns=window.SHANEConversation?.forEndeavor?.(selected)||window.SHANEConversation?.read?.()?.turns||[];
 const previous=turns.slice().reverse().find(turn=>turn&&typeof turn.text==="string"&&turn.text.trim()&&turn.kind!=="endeavor-transition"&&turn.kind!=="navigation");
 return previous?.text?.trim()||"";
}
function init(){
 const nav=document.querySelector(".shane-unified-nav");if(!nav)return;
 const group=document.createElement("div");group.className="shane-endeavor-actions";
 const conversation=document.createElement("div");conversation.className="shane-shared-vision-composer";
 const prompt=document.createElement("label");prompt.htmlFor="shane-shared-vision-input";prompt.textContent="What would you like us to create or work on?";
 const entry=document.createElement("textarea");entry.id="shane-shared-vision-input";entry.rows=2;
 entry.placeholder="Describe your endeavor naturally. Continue it across SHANE.";
 if((location.pathname.split("/").pop()||"index.html")!=="system-health.html"){
  try{entry.value=readDraft()}catch{}
 }
 entry.addEventListener("input",()=>{
  try{writeDraft(entry.value)}catch{}
  update();
  explainVision();
 });
 conversation.append(prompt,entry);
 let previousDraftKey=activeDraftKey();
 const refreshDraftContext=()=>{
  const next=activeDraftKey();
  if(next===previousDraftKey)return;
  previousDraftKey=next;
  entry.value=readDraft();
  update();explainVision();
 };
 document.addEventListener("shane:endeavor-context-ready",refreshDraftContext);
 document.addEventListener("shane:conversation-context-changed",refreshDraftContext);
 if((location.pathname.split("/").pop()||"index.html")==="system-health.html")conversation.hidden=true;

 const select=document.createElement("select");select.setAttribute("aria-label","Choose what SHANE should do with this idea");
 const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="Let SHANE choose the next step";select.append(placeholder);
 for(const [path,label] of targets){const option=document.createElement("option");option.value=path;option.textContent=label;select.append(option)}
 const button=document.createElement("button");button.type="button";button.textContent="Continue";
 const composerActions=document.createElement("div");composerActions.className="shane-composer-actions";
 const saveIdea=document.createElement("button");saveIdea.type="button";saveIdea.textContent="Remember this idea";
 const composerStatus=document.createElement("span");composerStatus.setAttribute("role","status");
 saveIdea.addEventListener("click",async()=>{
  const text=sharedComposerText();
  if(!text){composerStatus.textContent="Describe an idea first.";return}
  const selected=window.SHANECurrentEndeavor?.read?.()||null;
  if(!selected){composerStatus.textContent="Select an endeavor to save this idea to your account.";return}
  saveIdea.disabled=true;composerStatus.textContent="Saving your idea…";
  try{
   const saved=await window.SHANEConversationStore?.saveTurn?.(text,{page:location.pathname.split("/").pop()||"index.html",kind:"idea",endeavorId:selected});
   if(!saved?.saved)throw Error("Account history is unavailable.");
   if(window.SHANEEndeavorPlan?.refineJourney)await window.SHANEEndeavorPlan.refineJourney({request:text,endeavorId:selected});
   else if(window.SHANEEndeavorPlan?.create)await window.SHANEEndeavorPlan.create({vision:text,endeavorId:selected});
   // Feed the saved refinement into the current page's existing editable draft.
   // The draft adapter only fills empty fields; it never publishes or sends.
   const page=location.pathname.split("/").pop()||"index.html";
   const currentCapability=capabilityCatalog.find(item=>item.path===page);
   if(currentCapability){
    const plan=await window.SHANEEndeavorPlan?.latest?.(selected);
    if(window.SHANECurrentEndeavor?.read?.()===selected){
     document.dispatchEvent(new CustomEvent("shane:vision-context-ready",{
      detail:{page,endeavorId:selected,vision:text,latestRequest:text,
       arrivalContext:{purpose:plan?.vision||text,latestRequest:text,revision:plan?.revision||null}}
     }));
    }
   }
   // Prefer a workspace mentioned by the latest instruction over an older
   // prepared step. Keep all actions as explicit, user-selected continuations.
   const plan=await window.SHANEEndeavorPlan?.latest?.(selected);
   if(window.SHANECurrentEndeavor?.read?.()!==selected)return;
   const interpreted=window.SHANECapabilities?.interpret?.(text);
   const available=new Map((plan?.steps||[])
    .filter(step=>step.status==="proposed"||step.status==="prepared")
    .map(step=>[step.capabilityId,step]));
   const suggested=interpreted?.capabilities?.find(item=>item.path!==page&&available.has(item.id));
   const next=await window.SHANEEndeavorPlan?.nextAction?.(selected);
   if(window.SHANECurrentEndeavor?.read?.()!==selected)return;
   const chosen=suggested?{capabilityId:suggested.id,path:suggested.path,label:suggested.label}:next?.step;
   // Publish a structured, non-executing interpretation for existing pages
   // and integrations to consume without copying conversation into forms.
   document.dispatchEvent(new CustomEvent("shane:conversation-journey-updated",{
    detail:{endeavorId:selected,revision:plan?.revision||null,
     purpose:plan?.vision||text,latestRequest:text,
     steps:(plan?.steps||[]).map(step=>({capabilityId:step.capabilityId,status:step.status})),
     suggestedCapabilityId:chosen?.capabilityId||null,
     suggestedPath:chosen?.path||null,execution:"not-started"}
   }));
   if(chosen?.path&&chosen.path!==page){
    composerStatus.replaceChildren();
    composerStatus.append(document.createTextNode("Saved. Continue in "));
    const link=document.createElement("a");
    link.href=chosen.path;
    link.textContent=chosen.label||"the next workspace";
    link.addEventListener("click",event=>{
     event.preventDefault();
     if(link.getAttribute("aria-disabled")==="true")return;
     link.setAttribute("aria-disabled","true");
     void window.SHANEEndeavorPlan.handoff({endeavorId:selected,capabilityId:chosen.capabilityId})
      .then(()=>location.assign(chosen.path))
      .catch(error=>{link.removeAttribute("aria-disabled");composerStatus.textContent=String(error?.message||error)});
    });
    composerStatus.append(link,document.createTextNode("."));
   }else{
    composerStatus.textContent="Saved to this endeavor. Your editable draft is ready where supported.";
   }
   document.dispatchEvent(new Event("shane:conversation-context-changed"));
  }catch(error){composerStatus.textContent="The idea could not be fully saved to your account. "+String(error?.message||error)}
  finally{saveIdea.disabled=false}
 });
 composerActions.append(saveIdea,composerStatus);conversation.append(composerActions);
 // Keep the member's own text separate from automatic routing suggestions.
 const draftContext=document.createElement("small");draftContext.className="shane-draft-context";
 const showDraftContext=()=>{
  const id=window.SHANECurrentEndeavor?.read?.();
  draftContext.textContent=id?"Draft for your selected endeavor":"Personal draft on this device";
 };
 showDraftContext();
 document.addEventListener("shane:endeavor-context-ready",showDraftContext);
 document.addEventListener("shane:conversation-context-changed",showDraftContext);
 conversation.insertBefore(draftContext,composerActions);
 const continueConversation=document.createElement("details");continueConversation.className="shane-conversation-thread";
 const threadHeading=document.createElement("summary");threadHeading.textContent="Your endeavor conversation";
 const threadEntries=document.createElement("div");threadEntries.className="shane-conversation-thread-entries";
 const threadStatus=document.createElement("span");threadStatus.setAttribute("role","status");
 const loadThread=async()=>{
  const selected=window.SHANECurrentEndeavor?.read?.()||null;
  threadEntries.replaceChildren();threadStatus.textContent="";
  if(!selected||!window.SHANEConversationStore?.list){continueConversation.hidden=true;return}
  continueConversation.hidden=false;
  try{
   // Retrieve dialogue directly, independently of plan revision volume.
   const rows=await window.SHANEConversationStore.list({
    endeavorId:selected,limit:12,
    kinds:["idea","ai-request","ai-response","vision","conversation","note"]
   });
   if(window.SHANECurrentEndeavor?.read?.()!==selected)return;
   const ideas=rows.slice(0,12).reverse();
   if(!ideas.length){threadStatus.textContent="Your saved ideas will appear here as we develop this endeavor.";return}
   for(const idea of ideas){
    const message=document.createElement("p");message.className="shane-conversation-thread-message";
    const where=document.createElement("small");where.textContent=idea.entry_kind==="ai-response"?"SHANE AI":idea.entry_kind==="ai-request"?"You":String(idea.source_page||"SHANE").replace(".html","");
    const content=document.createElement("span");content.textContent=idea.body;
    message.append(where,content);threadEntries.append(message);
   }
  }catch{threadStatus.textContent="Saved conversation is not available right now."}
 };
 continueConversation.append(threadHeading,threadEntries,threadStatus);
 document.addEventListener("shane:endeavor-context-ready",()=>{aiReply.textContent="";aiNext.replaceChildren();aiNext.hidden=true;void loadThread()});
 document.addEventListener("shane:conversation-context-changed",()=>void loadThread());
 document.addEventListener("shane:endeavor-plan-ready",()=>void loadThread());
 document.addEventListener("shane:conversation-saved",event=>{if(event.detail?.endeavorId===window.SHANECurrentEndeavor?.read?.())void loadThread()});
 void loadThread();
 const usePrevious=document.createElement("button");usePrevious.type="button";usePrevious.textContent="Continue from saved idea";
 usePrevious.addEventListener("click",async()=>{
  const selected=window.SHANECurrentEndeavor?.read?.()||null;
  if(!selected){composerStatus.textContent="Select an endeavor first.";return}
  try{
   const plan=await window.SHANEEndeavorPlan?.latest?.(selected);
   let saved=plan?.latestRequest||plan?.vision||"";
   if(!saved){
    const rows=await window.SHANEConversationStore?.list?.({endeavorId:selected,limit:100});
    const last=rows?.find(row=>!["endeavor-plan","endeavor-transition"].includes(row.entry_kind)&&typeof row.body==="string"&&row.body.trim());
    saved=last?.body||"";
   }
   if(!saved){composerStatus.textContent="No saved idea was found for this endeavor.";return}
   if(entry.value.trim()&&entry.value.trim()!==saved.trim()&&!window.confirm("Replace your current conversation draft with the saved endeavor request?"))return;
   if(window.SHANECurrentEndeavor?.read?.()!==selected){composerStatus.textContent="The selected endeavor changed. Choose it again to resume.";return}
   entry.value=saved;
   try{writeDraft(entry.value)}catch{}
   update();explainVision();entry.focus();
   composerStatus.textContent="Saved idea restored to the conversation. Refine it or continue.";
  }catch{composerStatus.textContent="Saved ideas are unavailable right now."}
 });
 composerActions.insertBefore(usePrevious,composerStatus);
 const planProgress=document.createElement("details");planProgress.className="shane-plan-progress";
 const planHeading=document.createElement("summary");planHeading.textContent="Our endeavor's next steps";
 const planSteps=document.createElement("div");planSteps.className="shane-plan-progress-steps";
 const planMessage=document.createElement("span");planMessage.setAttribute("role","status");
 let planLoadSequence=0;
 const refreshProgress=async()=>{
  const selected=window.SHANECurrentEndeavor?.read?.()||null,sequence=++planLoadSequence;
  planSteps.replaceChildren();planMessage.textContent="";
  if(!selected||!window.SHANEEndeavorPlan?.latest){planProgress.hidden=true;return}
  try{
   const plan=await window.SHANEEndeavorPlan.latest(selected);
   if(sequence!==planLoadSequence||window.SHANECurrentEndeavor?.read?.()!==selected)return;
   planProgress.hidden=!plan?.steps?.length;
   if(!plan?.steps?.length)return;
   for(const step of plan.steps){
    const item=document.createElement("div");item.className="shane-plan-progress-step";
    const label=document.createElement("span");label.textContent=step.label;
    const state=document.createElement("span");state.textContent=step.status;
    const advance=document.createElement("button");advance.type="button";
    advance.textContent=step.status==="completed"?"Reopen":"Mark complete";
    advance.addEventListener("click",async()=>{
     advance.disabled=true;planMessage.textContent="Updating the endeavor…";
     try{
      await window.SHANEEndeavorPlan.setStep({endeavorId:selected,capabilityId:step.capabilityId,status:step.status==="completed"?"proposed":"completed"});
      planMessage.textContent="Your endeavor's progress is saved.";
      await refreshProgress();
     }catch{planMessage.textContent="Progress could not be saved to your account.";advance.disabled=false}
    });
    item.append(label,state,advance);planSteps.append(item);
   }
  }catch{planProgress.hidden=true}
 };
 planProgress.append(planHeading,planSteps,planMessage);
 document.addEventListener("shane:endeavor-plan-saved",()=>void refreshProgress());
 document.addEventListener("shane:endeavor-context-ready",()=>void refreshProgress());
 document.addEventListener("shane:conversation-context-changed",()=>void refreshProgress());
 document.addEventListener("shane:endeavor-plan-ready",()=>void refreshProgress());
 void refreshProgress();
 const conversationReply=document.createElement("div");conversationReply.className="shane-conversation-reply";
 conversationReply.setAttribute("role","status");conversationReply.setAttribute("aria-live","polite");
 const askAI=document.createElement("button");askAI.type="button";askAI.textContent="Talk with SHANE AI";
 const restorePlan=document.createElement("button");restorePlan.type="button";restorePlan.textContent="Continue saved creation plan";
 restorePlan.onclick=async()=>{
  const endeavorId=window.SHANECurrentEndeavor?.read?.();
  if(!endeavorId){aiReply.textContent="Select an endeavor first.";return}
  restorePlan.disabled=true;
  try{
   const saved=await window.SHANEConversationStore.loadCreationPlan({endeavorId});
   if(!saved){aiReply.textContent="No saved creation plan for this endeavor.";return}
   const progress=await window.SHANEConversationStore.inspectSavedEndeavor(saved);
   const overview=await window.SHANEConversationStore.describeSavedCreationPlan({endeavorId});
   aiReply.textContent=overview.message+" "+overview.steps.map(step=>step.number+". "+step.type+": "+step.status).join("; ");
   aiNext.replaceChildren();
   for(const item of progress.completed){
    const link=document.createElement("a");link.href=item.url;link.textContent="Open "+item.type;
    aiNext.append(link,document.createTextNode(" "));
   }
   if(!progress.complete){
    const resume=document.createElement("button");resume.type="button";resume.textContent="Continue remaining creations";
    resume.onclick=async()=>{
     resume.disabled=true;
     try{
      const outcome=await window.SHANEConversationStore.continueSavedEndeavor(saved);
      aiReply.textContent=outcome.complete?"All private creations saved.":"Stopped at step "+outcome.failedStep+": "+outcome.error;
      aiNext.replaceChildren();
      const latest=await window.SHANEConversationStore.inspectSavedEndeavor(saved);
      for(const item of latest.completed){const link=document.createElement("a");link.href=item.url;link.textContent="Open "+item.type;aiNext.append(link,document.createTextNode(" "))}
      if(!latest.complete)aiNext.append(resume);
     }catch(error){aiReply.textContent=error.message}
     finally{resume.disabled=false}
    };
    aiNext.append(resume);
   }
   aiNext.hidden=false;
   document.dispatchEvent(new CustomEvent("shane:endeavor-progress-restored",{detail:{endeavorId,completed:progress.completed.length,remaining:progress.remaining}}));
  }catch(error){aiReply.textContent=error.message}
  finally{restorePlan.disabled=false}
 };
 const findPlans=document.createElement("button");findPlans.type="button";findPlans.textContent="Find my saved creation plans";
 findPlans.onclick=async()=>{
  findPlans.disabled=true;
  try{
   const plans=await window.SHANEConversationStore.searchSavedCreationPlans({query:sharedComposerText(),limit:20});
   aiNext.replaceChildren();
   if(!plans.length){aiReply.textContent="No saved creation plans found.";return}
   aiReply.textContent="Found "+plans.length+" saved endeavors. Select a plan to inspect its creations.";
   for(const plan of plans){
    const choice=document.createElement("button");choice.type="button";
    choice.textContent=plan.types.join(", ")+" · "+new Date(plan.at).toLocaleDateString();
    choice.onclick=async()=>{
     choice.disabled=true;
     try{
      const overview=await window.SHANEConversationStore.describeSavedCreationPlan({endeavorId:plan.endeavorId});
      aiReply.textContent=overview.message+" "+overview.steps.map(step=>step.number+". "+step.type+": "+step.status).join("; ");
      aiNext.replaceChildren();
      for(const step of overview.steps){
       if(!step.url)continue;
       const link=document.createElement("a");link.href=step.url;link.textContent="Open "+step.type;
       aiNext.append(link,document.createTextNode(" "));
      }
      if(!overview.complete){
       const continueButton=document.createElement("button");continueButton.type="button";continueButton.textContent="Continue this endeavor";
       continueButton.onclick=async()=>{
        continueButton.disabled=true;
        try{
         const saved=await window.SHANEConversationStore.loadCreationPlan({endeavorId:plan.endeavorId});
         const outcome=await window.SHANEConversationStore.continueSavedEndeavor(saved);
         aiReply.textContent=outcome.complete?"All private creations saved.":"Stopped at step "+outcome.failedStep+": "+outcome.error;
        }catch(error){aiReply.textContent=error.message}
        finally{continueButton.disabled=false}
       };
       aiNext.append(continueButton);
      }
     }catch(error){aiReply.textContent=error.message}
     finally{choice.disabled=false}
    };
    aiNext.append(choice);
   }
   aiNext.hidden=false;
  }catch(error){aiReply.textContent=error.message}
  finally{findPlans.disabled=false}
 };
 const aiReply=document.createElement("p");aiReply.className="shane-ai-conversation-response";aiReply.setAttribute("role","status");
 const aiNext=document.createElement("div");aiNext.className="shane-conversation-reply-actions";aiNext.hidden=true;aiReply.setAttribute("aria-live","polite");aiReply.style.whiteSpace="pre-wrap";
 entry.addEventListener("keydown",event=>{if(event.key==="Enter"&&(event.ctrlKey||event.metaKey)&&!event.isComposing){event.preventDefault();if(!askAI.disabled)askAI.click()}});
 askAI.addEventListener("click",async()=>{
  const request=sharedComposerText(),endeavorId=window.SHANECurrentEndeavor?.read?.();
  if(!request){aiReply.textContent="Describe what you want to create first.";return}
  if(!endeavorId){aiReply.textContent="Save or select an endeavor to keep this conversation connected to your work.";return}
  const converse=window.SHANEConversationStore?.converse;
  if(!converse){aiReply.textContent="SHANE's conversation connection is still loading.";return}
  askAI.disabled=true;aiReply.textContent="Exploring your vision…";aiNext.hidden=true;aiNext.replaceChildren();
  let exchangeSaved=false;
  try{
   const plan=await window.SHANEEndeavorPlan?.latest?.(endeavorId);
   if(window.SHANECurrentEndeavor?.read?.()!==endeavorId)return;
   const data=await converse({endeavorId,request,purpose:plan?.vision||request});
   if(window.SHANECurrentEndeavor?.read?.()!==endeavorId)return;
   if(typeof data?.response!=="string"||!data.response.trim())throw Error("SHANE returned no response.");
   aiReply.textContent=data.response;
   // An explicit empty AI plan means this is a conversation, not an order to build.
   // Only fall back to keyword interpretation when the AI planner is unavailable.
   const aiPlan=Array.isArray(data?.creationPlan?.steps)?data.creationPlan.steps:null;
   const supported=new Set(["new-website","website","community","campaign","listing"]);
   const validAIPlan=aiPlan!==null&&aiPlan.length<=8&&aiPlan.every(step=>
    supported.has(step?.type)&&typeof step?.vision==="string"&&step.vision.trim().length>=8&&step.vision.length<=10000);
   const interpreted=validAIPlan
    ?{steps:aiPlan.map(step=>({type:step.type,vision:step.vision.trim(),endeavorId,...(step.type==="website"&&siteChoice.value?{siteId:siteChoice.value}:{})})),requiresReview:true,executable:false}:null;
   // Do not turn a provider failure into an accidental build suggestion.
   // Keyword fallback is reserved for an older conversation service without a planner field.
   const plannerProvided=Object.prototype.hasOwnProperty.call(data||{},"creationPlan");
   const initialProposal=interpreted||(!plannerProvided?window.SHANEConversationStore?.proposeCreationSequence?.({vision:request,endeavorId}):null);
   const proposal=initialProposal&&window.SHANEConversationStore?.prepareCreationSequence?.({proposal:initialProposal,updates:{deadline:deadline.value,siteId:siteChoice.value}})||initialProposal;
   // A private creation may span multiple capabilities, but only the member's
   // confirmed plan can enter the persistence and execution path.
   if(proposal?.steps?.length){
    const summaryParts=proposal.steps.map((step,index)=>(index+1)+". "+step.type.replace("new-","")+" : "+step.vision);
    const detail=document.createElement("details");
    const heading=document.createElement("summary");heading.textContent="Review SHANE's proposed creations";
    const outline=document.createElement("p");outline.style.whiteSpace="pre-wrap";
    outline.textContent=summaryParts.join("\n\n");
    detail.append(heading,outline);
    aiNext.append(detail);
   }
   // Campaign deadlines remain the member's decision; a proposal never supplies one silently.
   if(plannerProvided&&!validAIPlan){
    const note=document.createElement("p");
    note.textContent="SHANE can keep exploring this idea. Its creation plan is not ready, so no draft will be started.";
    aiNext.append(note);
    aiNext.hidden=false;
   }
   if(validAIPlan&&aiPlan.length===0){
    aiNext.replaceChildren();
    aiNext.hidden=true;
   }
   if(proposal?.steps?.length>=1&&!proposal.ready&&proposal.steps.some(step=>step.type==="campaign")&&!deadline.value){
    const note=document.createElement("p");
    note.textContent="SHANE has interpreted your campaign idea. Choose its interest deadline to create a private draft; nothing will be published.";
    aiNext.append(note);
    aiNext.hidden=false;
   }
   if(proposal?.steps?.length>=1){
    const summary=document.createElement("p");
    summary.textContent="SHANE can prepare "+proposal.steps.map(step=>step.type.replace("new-","")).join(", ")+".";
    aiNext.append(summary);
    if(!proposal.ready){
     const refresh=document.createElement("button");
     refresh.type="button";
     refresh.textContent="Use my updated details";
     refresh.onclick=()=>{
      const updated=window.SHANEConversationStore?.prepareCreationSequence?.({proposal:initialProposal,updates:{deadline:deadline.value,siteId:siteChoice.value}});
      if(updated?.ready){
       refresh.remove();
       summary.textContent="Your private drafts are ready to create.";
       const create=document.createElement("button");
       create.type="button";
       create.textContent=updated.steps.length===1?"Create my private draft":"Create these private drafts";
       create.onclick=async()=>{
        create.disabled=true;
        summary.textContent="Creating private drafts…";
        try{
         await window.SHANEConversationStore.saveCreationPlan({steps:updated.steps,endeavorId});
         const outcome=await window.SHANEConversationStore.continueSavedEndeavor({steps:updated.steps,endeavorId});
         summary.textContent=outcome.complete?"Created "+outcome.completed.length+" private drafts.":"Created "+outcome.completed.length+" drafts; step "+outcome.failedStep+" stopped: "+outcome.error;
         for(const item of outcome.completed){
          const link=document.createElement("a");
          link.href=item.url;
          link.textContent="Open "+item.type;
          aiNext.append(link,document.createTextNode(" "));
         }
         if(!outcome.complete){
          const resume=document.createElement("button");
          resume.type="button";
          resume.textContent="Continue remaining creations";
          resume.onclick=async()=>{
           resume.disabled=true;
           try{
            const next=await window.SHANEConversationStore.continueSavedEndeavor({steps:updated.steps,endeavorId});
            summary.textContent=next.complete?"All private drafts created.":"Stopped at step "+next.failedStep+": "+next.error;
            for(const item of next.completed){
             if(outcome.completed.some(saved=>saved.id===item.id))continue;
             const link=document.createElement("a");
             link.href=item.url;link.textContent="Open "+item.type;
             aiNext.append(link,document.createTextNode(" "));
            }
            if(!next.complete)resume.disabled=false;
           }catch(error){summary.textContent=error.message;resume.disabled=false}
          };
          aiNext.append(resume);
         }
        }catch(error){summary.textContent=error.message;create.disabled=false}
       };
       aiNext.append(create);
      }else{
       summary.textContent=updated?.reason||"More information is needed to prepare your private drafts.";
      }
     };
     aiNext.append(refresh);
    }
    if(proposal.ready){
     try{
      const progress=await window.SHANEConversationStore.inspectSavedEndeavor({endeavorId,steps:proposal.steps});
      if(progress.completed.length){
       summary.textContent=progress.completed.length+" saved creations verified; "+progress.remaining+" remaining.";
       for(const item of progress.completed){
        const link=document.createElement("a");link.href=item.url;link.textContent="Open saved "+item.type;
        aiNext.append(link,document.createTextNode(" "));
       }
      }
     }catch(error){summary.textContent="SHANE can prepare these drafts. Saved progress could not be inspected: "+error.message;}
     const execute=document.createElement("button");
     execute.type="button";
     execute.textContent=proposal.steps.length===1?"Create my private draft":"Create these private drafts";
     execute.onclick=async()=>{
      execute.disabled=true;
      summary.textContent="Creating private drafts…";
      try{
       await window.SHANEConversationStore.saveCreationPlan({steps:proposal.steps,endeavorId});
       const outcome=await window.SHANEConversationStore.continueSavedEndeavor({steps:proposal.steps,endeavorId});
       if(!outcome.complete&&outcome.completed.length){
        const resume=document.createElement("button");resume.type="button";resume.textContent="Continue remaining creations";
        resume.onclick=async()=>{
         resume.disabled=true;
         const next=await window.SHANEConversationStore.continueSavedEndeavor({steps:proposal.steps,endeavorId});
         summary.textContent=next.complete?"All private drafts created.":"Stopped at step "+next.failedStep+": "+next.error;
         for(const item of next.completed.slice(outcome.completed.length)){
          const link=document.createElement("a");link.href=item.url;link.textContent="Open "+item.type;aiNext.append(link);
         }
        };
        aiNext.append(resume);
       }
       summary.textContent=outcome.complete?"Created "+outcome.completed.length+" private drafts.":"Created "+outcome.completed.length+" private drafts; step "+outcome.failedStep+" stopped: "+outcome.error;
       for(const item of outcome.completed){
        const link=document.createElement("a");link.href=item.url;link.textContent="Open "+item.type;
        aiNext.append(link,document.createTextNode(" "));
       }
      }catch(error){summary.textContent=error.message}
     };
     aiNext.append(execute);
     aiNext.hidden=false;
    }else{summary.textContent+=" "+(proposal.reason||"More details are needed before creation.");aiNext.hidden=false;}
   }
   // Preserve the actual exchange in the same owner-scoped endeavor history
   // already used by every SHANE workspace. Never mistake an AI suggestion
   // for a completed action or publish it as public content.
   if(window.SHANEConversationStore?.saveTurn){
    try{
     const page=location.pathname.split("/").pop()||"index.html";
     const questionSaved=await window.SHANEConversationStore.saveTurn(request,{page,kind:"ai-request",endeavorId});
     const answerSaved=await window.SHANEConversationStore.saveTurn(data.response,{page,kind:"ai-response",endeavorId});
     if(!questionSaved?.saved||!answerSaved?.saved)throw Error("Account history was not saved.");
     exchangeSaved=true;
    }catch(error){
     aiReply.textContent=data.response+"\n\nThis response is visible here, but saving it to account history could not be confirmed.";
    }
   }
   // A conversation refinement becomes part of the saved endeavor plan,
   // so the builder and other workspaces receive the updated intent.
   let refinedPlan=null;
   if(exchangeSaved&&window.SHANEEndeavorPlan?.refineJourney){
    try{
     const refined=await window.SHANEEndeavorPlan.refineJourney({endeavorId,request});
     if(refined?.plan){
      refinedPlan=refined.plan;
      document.dispatchEvent(new CustomEvent("shane:conversation-journey-updated",{detail:{
       endeavorId,revision:refined.plan.revision,purpose:refined.plan.vision,
       latestRequest:request,steps:refined.plan.steps||[],executed:false
      }}));
     }
    }catch(error){composerStatus.textContent="Conversation saved. The endeavor plan could not yet be updated.";}
   }
   // The AI dialogue should lead directly into the existing working capability,
   // not ask members to copy its output into another form.
   // Offer actual active workspaces from the saved plan, not hypothetical
   // AI-generated URLs. The member chooses which capability to prepare.
   if(exchangeSaved&&window.SHANECurrentEndeavor?.read?.()===endeavorId){
    try{
     let journey=null;
     try{journey=window.SHANEEndeavorPlan?.journey?await window.SHANEEndeavorPlan.journey(endeavorId):null}catch(error){
      // An unavailable plan must not block working Network destinations.
      composerStatus.textContent="Your conversation is saved. You can continue in the Network while the plan is unavailable.";
     }
     if(window.SHANECurrentEndeavor?.read?.()===endeavorId){
      const steps=(journey?.steps||[]).filter(step=>step.path&&["proposed","prepared"].includes(step.status)).slice(0,5);
      for(const step of steps){
       const link=document.createElement("a");
       link.href=step.path;link.textContent="Continue: "+step.label;
       link.addEventListener("click",async event=>{
        event.preventDefault();
        if(window.SHANECurrentEndeavor?.read?.()!==endeavorId){composerStatus.textContent="Choose the current endeavor before continuing.";return}
        try{
         const result=await window.SHANEEndeavorPlan.handoff({endeavorId,capabilityId:step.capabilityId});
         if(result?.path)location.assign(result.path);
        }catch(error){composerStatus.textContent=String(error?.message||error)}
       });
       aiNext.append(link);
      }
      // A newly described capability may not yet appear in an older saved
      // plan. Offer the existing working module without inventing a route or
      // claiming that the AI has already performed the action.
      const listed=new Set(steps.map(step=>step.capabilityId));
      // Carry the endeavor's original purpose and latest refinement together.
      // A new instruction should extend the creation, not erase its foundations.
      const purpose=refinedPlan?.vision||journey?.purpose||plan?.vision||request;
      const fullVision=purpose===request?request:purpose+"\n\nCurrent refinement: "+request;
      const interpreted=window.SHANECapabilities?.interpret?.(request);
      const suggested=interpreted?.capabilities||[];
      // The user may name several goals in one conversation. Keep every
      // supported destination discoverable rather than hiding all but four.
      // Match both the new request and the enduring purpose. An endeavor can
      // involve a shop, a community and an event even when this turn mentions
      // only one of those activities.
      const original=purpose===request?[]:(window.SHANECapabilities?.interpret?.(purpose)?.capabilities||[]);
      const priorRequests=Array.isArray(refinedPlan?.visionHistory)?refinedPlan.visionHistory:Array.isArray(plan?.visionHistory)?plan.visionHistory:[];
      const priorCapabilities=priorRequests.flatMap(item=>{
       const text=typeof item==="string"?item:typeof item?.request==="string"?item.request:"";
       return text?window.SHANECapabilities?.interpret?.(text)?.capabilities||[]:[];
      });
      const availableDestinations=[...suggested,...original,...priorCapabilities].filter((capability,index,all)=>
       capability.path&&!listed.has(capability.id)&&all.findIndex(item=>item.id===capability.id)===index);
      for(const capability of availableDestinations){
       if(listed.has(capability.id)||!capability.path)continue;
       const link=document.createElement("a");
       link.href=capability.path;link.textContent="Explore: "+capability.label;
       link.addEventListener("click",event=>{
        event.preventDefault();
        if(window.SHANECurrentEndeavor?.read?.()!==endeavorId){
         composerStatus.textContent="Choose the current endeavor before continuing.";return;
        }
        const prepared=window.SHANECapabilities?.prepare?.({
         capabilityId:capability.id,vision:fullVision,endeavorId
        });
        if(prepared?.ok&&prepared?.destination){
         // Attach the current revision to the same handoff already consumed
         // by the destination's shared arrival adapter.
         try{
          const key="shane-intent-handoff-v1";
          const pending=JSON.parse(sessionStorage.getItem(key)||"null");
          if(pending?.destination===prepared.destination&&pending.endeavorId===endeavorId){
           pending.context={purpose,latestRequest:request,revision:journey?.revision||plan?.revision||null,
            steps:(journey?.steps||[]).map(step=>({capabilityId:step.capabilityId,status:step.status}))};
           sessionStorage.setItem(key,JSON.stringify(pending));
          }
         }catch{}
         // A direct click to create a website authorizes a private AI draft,
         // never publishing or replacing an account-saved site.
         if(capability.path==="builder.html"){
          try{sessionStorage.setItem("shane-ai-build-request-v1",JSON.stringify({
           endeavorId,vision:fullVision,created:Date.now(),destination:"builder.html"
          }))}catch{}
         }
         location.assign(prepared.destination);
        }else composerStatus.textContent="This workspace could not be prepared yet. Your conversation remains saved.";
       });
       aiNext.append(link);listed.add(capability.id);
      }
      aiNext.hidden=!aiNext.children.length;
     }
    }catch{}
   }
   document.dispatchEvent(new CustomEvent("shane:ai-conversation-response",{detail:{endeavorId,request,response:data.response,executed:false}}));
   if(exchangeSaved&&window.SHANECurrentEndeavor?.read?.()===endeavorId){continueConversation.open=true;void loadThread();}
   // The member's next message should be a fresh conversational turn.
   // Keep the saved endeavor and its underlying editable project unchanged.
   const composer=document.getElementById("shane-shared-vision-input");
   if(exchangeSaved&&window.SHANECurrentEndeavor?.read?.()===endeavorId&&composer&&composer.value.trim()===request){
    composer.value="";
    composer.dispatchEvent(new Event("input",{bubbles:true}));
    composer.focus();
   }
  }catch(error){aiReply.textContent=String(error?.message||error)}
  finally{askAI.disabled=false}
 });
 const replyHeading=document.createElement("strong");replyHeading.textContent="SHANE's next step";
 const replyText=document.createElement("p");
 const replyActions=document.createElement("div");replyActions.className="shane-conversation-reply-actions";
 conversationReply.append(replyHeading,replyText,replyActions,askAI);
 // The AI reply and actionable destinations are mounted with the shared composer below.
 // Keep the conversation button in the composer even when suggested next steps are hidden.
 conversation.append(askAI,restorePlan,findPlans);
 const explainVision=()=>{
  const text=sharedComposerText();
  conversationReply.hidden=!text;
  // Keep the latest answer visible while the member composes the next turn.
  replyActions.replaceChildren();
  if(!text)return;
  const result=interpretVision(text);
  const options=result.capabilities.filter(item=>!["dashboard","conversation-history","community-history","appearance"].includes(item.id));
  const destination=capabilityCatalog.find(item=>item.path===result.preferredDestination);
  replyText.textContent=options.length>1
   ?"I can begin with "+(destination?.label.toLowerCase()||"your idea")+" and carry the rest of your endeavor forward."
   :options.length===1?"I can begin with "+options[0].label.toLowerCase()+". We can refine your idea as you go."
   :"Let's begin shaping your idea together.";
  for(const item of options.slice(0,4)){
   const link=document.createElement("a");link.href=item.path;link.textContent=item.label;
   link.addEventListener("click",()=>prepareCapability({capabilityId:item.id,vision:text}));
   replyActions.append(link);
  }
 };
 const workflow=document.createElement("span");workflow.className="shane-action-workflow";workflow.setAttribute("aria-live","polite");
 const stageMatch=(text)=>interpretVision(text).capabilities.filter(item=>!["dashboard.html","conversation-history.html","community-history.html","appearance.html"].includes(item.path));
 const renderWorkflow=()=>{
  workflow.replaceChildren();
  const text=idea(),matches=stageMatch(text);if(matches.length<2)return;
  const label=document.createElement("span");label.textContent="Your idea involves several steps: ";workflow.append(label);
  for(const item of matches){
   const link=document.createElement("a");link.href=item.path;link.textContent=item.label;link.className="shane-action-workflow-link";
   link.addEventListener("click",()=>{prepareCapability({capabilityId:item.id,vision:text})});workflow.append(link);
  }
 };

 const planResume=document.createElement("span");planResume.className="shane-action-workflow";planResume.setAttribute("aria-live","polite");
 const showSavedPlan=async()=>{
  const selected=window.SHANECurrentEndeavor?.read?.();
  if(!selected||!window.SHANEEndeavorPlan?.latest){planResume.replaceChildren();return}
  try{
   const plan=await window.SHANEEndeavorPlan.latest(selected);
   if(window.SHANECurrentEndeavor?.read?.()!==selected)return;
   planResume.replaceChildren();
   if(!plan?.steps?.length)return;
   const remaining=plan.steps.filter(x=>x.status==="prepared"||x.status==="proposed");
   if(!remaining.length){planResume.textContent="Your saved endeavor plan has no unfinished steps.";return}
   const intro=document.createElement("span");intro.textContent="Next step for your endeavor: ";planResume.append(intro);
   for(const step of plan.steps.filter(x=>x.status==="prepared").concat(plan.steps.filter(x=>x.status==="proposed")).slice(0,1)){
    const item=capabilityCatalog.find(x=>x.id===step.capabilityId);if(!item)continue;
    const link=document.createElement("a");link.href=item.path;link.className="shane-action-workflow-link";
    link.textContent=step.label;
    link.addEventListener("click",event=>{event.preventDefault();void window.SHANEEndeavorPlan.handoff({endeavorId:selected,capabilityId:item.id}).then(()=>location.assign(item.path)).catch(error=>{planResume.textContent=String(error?.message||error)})});
    planResume.append(link);
   }
  }catch{planResume.replaceChildren()}
 };
 document.addEventListener("shane:endeavor-plan-saved",()=>void showSavedPlan());
 document.addEventListener("shane:endeavor-plan-ready",()=>void showSavedPlan());
 document.addEventListener("shane:endeavor-context-ready",()=>void showSavedPlan());
 document.addEventListener("shane:conversation-context-changed",()=>void showSavedPlan());
 void showSavedPlan();
 // Restore is an intentional, confirmed action, not a silent rollback.
 const revisionControl=document.createElement("details");revisionControl.className="shane-plan-revisions";
 const revisionSummary=document.createElement("summary");revisionSummary.textContent="Earlier versions";
 const revisionChoices=document.createElement("div");revisionChoices.className="shane-action-workflow";
 const revisionStatus=document.createElement("span");revisionStatus.setAttribute("role","status");
 revisionControl.append(revisionSummary,revisionChoices,revisionStatus);
 const loadRevisions=async()=>{
  const selected=window.SHANECurrentEndeavor?.read?.();
  revisionChoices.replaceChildren();
  if(!selected||!window.SHANEEndeavorPlan?.history){revisionControl.hidden=true;return}
  try{
   const revisions=await window.SHANEEndeavorPlan.history(selected,{limit:15});
   if(window.SHANECurrentEndeavor?.read?.()!==selected)return;
   revisionControl.hidden=revisions.length<2;
   for(const old of revisions.slice(1)){
    const restore=document.createElement("button");restore.type="button";
    restore.textContent="Restore revision "+old.revision;
    restore.addEventListener("click",async()=>{
     if(!window.confirm("Restore revision "+old.revision+" as a new plan version? Your newer versions will remain available."))return;
     restore.disabled=true;
     try{
      await window.SHANEEndeavorPlan.restore({endeavorId:selected,revision:old.revision});
      revisionStatus.textContent="Revision "+old.revision+" restored as a new version.";
      await showSavedPlan();await loadRevisions();
     }catch(error){revisionStatus.textContent="Could not restore that version. "+String(error?.message||error)}
     finally{restore.disabled=false}
    });
    revisionChoices.append(restore);
   }
  }catch{revisionControl.hidden=true}
 };
 revisionControl.addEventListener("toggle",()=>{if(revisionControl.open)void loadRevisions()});
 document.addEventListener("shane:endeavor-plan-ready",()=>{if(revisionControl.open)void loadRevisions()});
 document.addEventListener("shane:endeavor-context-ready",()=>{if(revisionControl.open)void loadRevisions()});
 document.addEventListener("shane:endeavor-plan-saved",()=>{if(revisionControl.open)void loadRevisions()});
 const status=document.createElement("span");status.setAttribute("role","status");status.className="shane-action-status";
 const suggestion=document.createElement("span");suggestion.className="shane-action-suggestion";suggestion.setAttribute("aria-live","polite");
 const update=()=>{const text=idea(),destination=suggest(text),label=targets.find(([path])=>path===destination)?.[1];suggestion.textContent=select.value?"You chose "+targets.find(([path])=>path===select.value)?.[1]:label?"SHANE suggests: "+label:"Describe your idea and SHANE will suggest a next step.";renderWorkflow()};
 // Existing SHANE navigation links also carry the current endeavor when a member
 // deliberately opens another creation or collaboration capability.
 nav.addEventListener("click",event=>{
  const link=event.target.closest?.("a[href]");
  if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0||link.target==="_blank"||link.hasAttribute("download"))return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin)return;
  const destination=url.pathname.split("/").pop();
  if(!targets.some(([path])=>path===destination))return;
  if(destination===(location.pathname.split("/").pop()||"index.html"))return;
  const text=idea();if(!text)return;
  // Never carry sensitive incident narratives into ordinary creator destinations.
  if((location.pathname.split("/").pop())==="system-health.html")return;
  let endeavorId=null;
  try{const saved=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;if(typeof saved==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(saved))endeavorId=saved}catch{}
  try{sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:text,endeavorId,created:Date.now()}));if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:text,created:Date.now()}))}catch{}
 });
 select.addEventListener("change",update);
 document.addEventListener("input",event=>{if(event.target?.id&&((fields[location.pathname.split("/").pop()||"index.html"]||[]).includes(event.target.id)||window.SHANEConversation?.draftSnapshot?.().some(item=>item.field===event.target.id)))update()});
 button.addEventListener("click",async()=>{
  let text=(location.pathname.split("/").pop())==="system-health.html"?"":idea();
  if(!text&&window.SHANEEndeavorPlan?.latest){
   try{const selected=window.SHANECurrentEndeavor?.read?.();if(selected){const plan=await window.SHANEEndeavorPlan.latest(selected);text=plan?.latestRequest||plan?.vision||""}}catch{}
  }
  if(!text&&window.SHANEConversationStore?.list){
   try{
    const active=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;
    if(!active||!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(active))throw Error("No selected endeavor");
    const entries=await window.SHANEConversationStore.list({endeavorId:active,limit:20});
    const preferred=entries.find(entry=>["idea","vision"].includes(entry.entry_kind)&&typeof entry.body==="string"&&entry.body.trim())||entries.find(entry=>!["endeavor-transition","endeavor-plan"].includes(entry.entry_kind)&&typeof entry.body==="string"&&entry.body.trim());
    text=preferred?.body?.trim()||"";
   }catch{}
  }
  if(!text){status.textContent="Describe your idea here or choose a saved endeavor to continue.";return}
  // Prefer the most recently expressed request for routing, while preserving
  // the whole saved endeavor as context for the receiving workspace.
  const destination=select.value||interpretVision(text).preferredDestination;
  if(!destination){status.textContent="Tell SHANE what you want to create, or choose a destination.";select.focus();return}
  button.disabled=true;status.textContent="Carrying your endeavor forward…";
  let endeavorId=null;
  try{const value=window.SHANECurrentEndeavor?.read?.();if(typeof value==="string")endeavorId=value}catch{}
  if(!endeavorId){try{const saved=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;if(typeof saved==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(saved))endeavorId=saved}catch{}}
  try{
   sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:text,endeavorId,created:Date.now()}));
   if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:text,created:Date.now()}));
  }catch{status.textContent="Unable to carry the idea in this browser.";button.disabled=false;return}
  // The ordinary Continue action now creates or revises the durable plan,
  // without asking members to copy their vision into a second form.
  if(endeavorId&&window.SHANEEndeavorPlan?.create){
   try{
    const plan=await window.SHANEEndeavorPlan.create({vision:text,endeavorId});
    if(plan?.vision){
     const combined=(plan.vision+(plan.latestRequest&&plan.latestRequest!==plan.vision?"\n\nCurrent refinement: "+plan.latestRequest:""));
     const payload={destination,text:combined,endeavorId,created:Date.now(),context:{purpose:plan.vision,latestRequest:plan.latestRequest||plan.vision,revision:plan.revision,steps:plan.steps.map(step=>({capabilityId:step.capabilityId,status:step.status}))}};
     sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify(payload));
     if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:combined,created:payload.created}));
    }
   }
   catch(error){status.textContent="Your idea continues, but the saved plan could not be confirmed."}
  }
  if(window.SHANEConversationStore?.saveTurn){
   try{
    const result=await window.SHANEConversationStore.saveTurn(text,{page:location.pathname.split("/").pop()||"index.html",kind:"endeavor-transition",endeavorId});
    if(!result.saved)status.textContent="Your idea will continue on the next page. Sign in to preserve it in account history.";
   }catch(error){status.textContent="Your idea is carried to the next page, but account history could not be confirmed."}
  }
  if(sharedComposerText()===text){try{sessionStorage.removeItem(activeDraftKey())}catch{}}
  location.assign(destination);
 });

 // Execute a supported creation from the same conversation used on every page.
 // No second composer, wizard, or automatic public action.

 // One executable action for the existing shared conversation, not separate setup buttons.
 const createAction=document.createElement("button");createAction.type="button";createAction.textContent="Create from this vision";
 const createStatus=document.createElement("span");createStatus.setAttribute("role","status");
 const deadline=document.createElement("input");deadline.type="datetime-local";deadline.hidden=true;
 deadline.setAttribute("aria-label","Interest deadline for campaign");
 const siteChoice=document.createElement("select");siteChoice.hidden=true;siteChoice.setAttribute("aria-label","Website to revise");
 let sitesLoaded=false;
 const capability=()=>{
  const vision=sharedComposerText().trim();
  if(/(?:revise|edit|change|update|improve|redesign|rewrite|modify)\b.{0,90}\b(?:website|site|homepage|web page)|(?:website|site|homepage)\b.{0,90}\b(?:revise|edit|change|update|improve|redesign|rewrite|modify)/i.test(vision))return "website";
  if(/build a website|create a website|make me a website|design my website|website for|build my site/i.test(vision))return "new-website";
  if(/concert|festival|fundrais|campaign|event|craft fair|gathering|ticket/i.test(vision))return "campaign";
  if(/community|club|association|group|chat room/i.test(vision))return "community";
  if(/listing|list my|offer my|share my service|looking for partners|find collaborators|opportunity|volunteer|advertise|promote my business/i.test(vision))return "listing";
  return null;
 };
 const syncAction=()=>{
  const type=capability();
  createAction.hidden=!type||sharedComposerText().trim().length<8;
  deadline.hidden=type!=="campaign";
  siteChoice.hidden=type!=="website";
  createAction.textContent=type==="new-website"?"Create website draft":type==="website"?"Revise my saved website":type==="campaign"?"Create private campaign draft":type==="community"?"Create private community":"Save private Network listing";
 };
 entry.addEventListener("input",syncAction);
 document.addEventListener("shane:conversation-context-changed",syncAction);
 document.addEventListener("shane:endeavor-context-ready",syncAction);
 const loadSites=async()=>{
  if(sitesLoaded)return;
  const store=window.SHANEConversationStore;
  if(!store?.ownedSites)return;
  const sites=await store.ownedSites();
  siteChoice.replaceChildren();
  const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="Choose the saved website to revise";siteChoice.append(placeholder);
  for(const site of sites){const option=document.createElement("option");option.value=site.id;option.textContent=site.name+" ("+site.status+")";siteChoice.append(option)}
  sitesLoaded=true;
 };
 createAction.onclick=async()=>{
  const vision=sharedComposerText().trim(),type=capability(),endeavorId=window.SHANECurrentEndeavor?.read?.()||null;
  if(!type||vision.length<8){createStatus.textContent="Describe what you want SHANE to create.";return}
  if(type==="website")await loadSites().catch(()=>{});
  const readiness=window.SHANEConversationStore?.inspectOperation?.({type,vision,siteId:siteChoice.value,deadline:deadline.value});
  if(readiness&&!readiness.ready){createStatus.textContent=readiness.reason;return}
  createAction.disabled=true;createStatus.textContent="SHANE is working on your "+type+".";
  try{
   const store=window.SHANEConversationStore;
   if(!store)throw Error("Creation connection is loading.");
   if(type==="website"){
    await loadSites();
    if(!siteChoice.value)throw Error("Choose the saved website to revise.");
   }
   const operation=await store.executeVision({type,vision,siteId:siteChoice.value,deadline:deadline.value,endeavorId});
   const linkTarget=operation.url,record=operation.id;
   const linkLabel=type==="website"?"Review revised website":type==="new-website"?"Open created website":type==="campaign"?"Review campaign":type==="community"?"Open community":"Review listing";
   // Keep the concrete creation available to the next page and to the next conversation.
   const creation={type,id:record,url:linkTarget,vision,endeavorId:endeavorId||null,created:Date.now()};
   try{sessionStorage.setItem("shane-last-created-artifact-v1",JSON.stringify(creation))}catch{}
   document.dispatchEvent(new CustomEvent("shane:artifact-created",{detail:creation}));
   createStatus.replaceChildren(document.createTextNode(type==="website"?"Website revision saved privately. ":"Saved privately. "));
   const link=document.createElement("a");link.href=linkTarget;link.textContent=linkLabel;createStatus.append(link);
   if(endeavorId){
    try{await store.saveTurn("Created private "+type+" "+record,{page:location.pathname.split("/").pop()||"index.html",kind:"creation",endeavorId})}
    catch{createStatus.append(document.createTextNode(" History save unconfirmed."))}
   }
  }catch(error){createStatus.textContent="Creation not confirmed: "+error.message}
  finally{createAction.disabled=false}
 };
 createAction.addEventListener("pointerenter",()=>{if(capability()==="website")void loadSites().catch(()=>{})});
 const recentCreation=document.createElement("span");recentCreation.setAttribute("role","status");
 const showRecentCreation=()=>{
  let item;try{item=JSON.parse(sessionStorage.getItem("shane-last-created-artifact-v1")||"null")}catch{}
  recentCreation.replaceChildren();
  if(!item||typeof item.url!=="string"||!["builder.html?","campaigns.html?","communities.html?","members.html?"].some(prefix=>item.url.startsWith(prefix))||!item.id||Date.now()-item.created>7*86400000)return;
  recentCreation.append(document.createTextNode("Continue your last creation: "));
  const link=document.createElement("a");link.href=item.url;link.textContent=item.type==="new-website"?"Website":item.type==="website"?"Revised website":item.type==="campaign"?"Campaign":item.type==="community"?"Community":"Network listing";
  recentCreation.append(link);
 };
 document.addEventListener("shane:artifact-created",showRecentCreation);
 const historyButton=document.createElement("button");historyButton.type="button";historyButton.textContent="Continue a saved creation";
 const historySearch=document.createElement("input");historySearch.type="search";historySearch.placeholder="Find a saved creation";historySearch.setAttribute("aria-label","Search saved creations");historySearch.hidden=true;
 const historyList=document.createElement("div");historyList.hidden=true;historyList.setAttribute("aria-live","polite");
 historyButton.onclick=async()=>{
  if(!historyList.hidden){historyList.hidden=true;historySearch.hidden=true;return}
  historyButton.disabled=true;historyList.hidden=false;historySearch.hidden=false;historyList.textContent="Finding your saved creations…";
  try{
   const store=window.SHANEConversationStore;
   if(!store?.recentCreations)throw Error("The saved creation connection is still loading.");
   const items=await store.findSavedCreations({query:historySearch.value,limit:20});
   historyList.replaceChildren();
   if(!items.length){historyList.textContent="No saved creations found in this account yet.";return}
   for(const item of items){
    const line=document.createElement("p");
    const link=document.createElement("a");link.href=item.url;link.textContent=item.title;
    line.append(document.createTextNode(item.type+": "),link);
    historyList.append(line);
   }
  }catch(error){historyList.textContent="Could not load saved creations: "+error.message}
  finally{historyButton.disabled=false}
 };
 historySearch.addEventListener("change",async()=>{
  if(historyList.hidden)return;
  historyList.textContent="Searching saved creations…";
  try{
   const items=await window.SHANEConversationStore.findSavedCreations({query:historySearch.value,limit:20});
   historyList.replaceChildren();
   if(!items.length){historyList.textContent="No matching saved creations.";return}
   for(const item of items){
    const line=document.createElement("p"),link=document.createElement("a");
    link.href=item.url;link.textContent=item.title;
    line.append(document.createTextNode(item.type+": "),link);historyList.append(line);
   }
  }catch(error){historyList.textContent="Search unavailable: "+error.message}
 });
 document.addEventListener("shane:artifact-created",()=>{if(!historyList.hidden){historyList.hidden=true;historySearch.hidden=true;historyList.replaceChildren()}});
 conversation.append(createAction,deadline,siteChoice,createStatus,recentCreation,historyButton,historySearch,historyList);syncAction();showRecentCreation();
 group.append(conversation,aiReply,aiNext,continueConversation,planProgress,conversationReply,select,button,suggestion,workflow,planResume,revisionControl,status);nav.append(group);update();explainVision();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();