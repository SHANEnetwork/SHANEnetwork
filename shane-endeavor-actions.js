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
 ["builder.html",/website|webpage|storefront|online shop|create a site|build a site|portfolio|landing page|online presence/i]
];
// A machine-readable capability contract for future model-driven orchestration.
// Only registered local destinations are allowed. Sensitive actions stay gated
// by the existing module's own authorization and explicit user confirmation.
const capabilityCatalog=Object.freeze(targets.filter(([path])=>path!=="system-health.html"&&path!=="contact.html").map(([path,label])=>Object.freeze({
 id:path.replace(/\.html$/,""),path,label,
 action:"prepare",execution:"requires-module",requiresConfirmation:true
})));
function interpretVision(text){
 const vision=String(text||"").trim().slice(0,4000);
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
 const text=String(vision||"").trim().slice(0,4000);
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
window.SHANECapabilities=Object.freeze({catalog:()=>capabilityCatalog.slice(),interpret:interpretVision,prepare:prepareCapability});
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
  ["builder.html",/\b(build|create|design|make|revise)\b.{0,45}\b(website|site|page|storefront|portfolio)\b/i]
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
const readDraft=()=>{try{return String(sessionStorage.getItem(activeDraftKey())||"").slice(0,4000)}catch{return ""}};
const writeDraft=value=>{try{sessionStorage.setItem(activeDraftKey(),String(value||"").slice(0,4000))}catch{}};

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
   if(window.SHANEEndeavorPlan?.create)await window.SHANEEndeavorPlan.create({vision:text,endeavorId:selected});
   composerStatus.textContent="Saved to this endeavor. You can continue refining it.";
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
   const rows=await window.SHANEConversationStore.list({endeavorId:selected,limit:40});
   if(window.SHANECurrentEndeavor?.read?.()!==selected)return;
   const ideas=rows.filter(row=>!["endeavor-plan","endeavor-transition"].includes(row.entry_kind)&&typeof row.body==="string"&&row.body.trim()).slice(0,5).reverse();
   if(!ideas.length){threadStatus.textContent="Your saved ideas will appear here as we develop this endeavor.";return}
   for(const idea of ideas){
    const message=document.createElement("p");message.className="shane-conversation-thread-message";
    const where=document.createElement("small");where.textContent=String(idea.source_page||"SHANE").replace(".html","");
    const content=document.createElement("span");content.textContent=idea.body.slice(0,1200);
    message.append(where,content);threadEntries.append(message);
   }
  }catch{threadStatus.textContent="Saved conversation is not available right now."}
 };
 continueConversation.append(threadHeading,threadEntries,threadStatus);
 document.addEventListener("shane:endeavor-context-ready",()=>void loadThread());
 document.addEventListener("shane:conversation-context-changed",()=>void loadThread());
 document.addEventListener("shane:endeavor-plan-ready",()=>void loadThread());
 void loadThread();
 const usePrevious=document.createElement("button");usePrevious.type="button";usePrevious.textContent="Continue from saved idea";
 usePrevious.addEventListener("click",async()=>{
  const selected=window.SHANECurrentEndeavor?.read?.()||null;
  if(!selected){composerStatus.textContent="Select an endeavor first.";return}
  try{
   const rows=await window.SHANEConversationStore?.list?.({endeavorId:selected,limit:100});
   const last=rows?.find(row=>!["endeavor-plan","endeavor-transition"].includes(row.entry_kind)&&typeof row.body==="string"&&row.body.trim());
   if(!last){composerStatus.textContent="No saved idea was found for this endeavor.";return}
   entry.value=last.body.slice(0,4000);
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
 const replyHeading=document.createElement("strong");replyHeading.textContent="SHANE's next step";
 const replyText=document.createElement("p");
 const replyActions=document.createElement("div");replyActions.className="shane-conversation-reply-actions";
 conversationReply.append(replyHeading,replyText,replyActions);
 const explainVision=()=>{
  const text=sharedComposerText();
  conversationReply.hidden=!text;
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
    link.addEventListener("click",()=>{prepareCapability({capabilityId:item.id,vision:plan.vision,endeavorId:selected})});
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
  try{sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:text.slice(0,4000),endeavorId,created:Date.now()}));if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:text.slice(0,4000),created:Date.now()}))}catch{}
 });
 select.addEventListener("change",update);
 document.addEventListener("input",event=>{if(event.target?.id&&((fields[location.pathname.split("/").pop()||"index.html"]||[]).includes(event.target.id)||window.SHANEConversation?.draftSnapshot?.().some(item=>item.field===event.target.id)))update()});
 button.addEventListener("click",async()=>{
  let text=(location.pathname.split("/").pop())==="system-health.html"?"":idea();
  if(!text&&window.SHANEConversationStore?.list){
   try{
    const active=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;
    if(!active||!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(active))throw Error("No selected endeavor");
    const entries=await window.SHANEConversationStore.list({endeavorId:active,limit:20});
    const preferred=entries.find(entry=>!["endeavor-transition","endeavor-plan"].includes(entry.entry_kind)&&typeof entry.body==="string"&&entry.body.trim());
    text=preferred?.body?.trim()||"";
   }catch{}
  }
  if(!text){status.textContent="Describe your idea here or choose a saved endeavor to continue.";return}
  const destination=select.value||interpretVision(text).preferredDestination;
  if(!destination){status.textContent="Tell SHANE what you want to create, or choose a destination.";select.focus();return}
  button.disabled=true;status.textContent="Carrying your endeavor forward…";
  let endeavorId=null;
  try{const value=window.SHANECurrentEndeavor?.read?.();if(typeof value==="string")endeavorId=value}catch{}
  if(!endeavorId){try{const saved=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;if(typeof saved==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(saved))endeavorId=saved}catch{}}
  try{
   sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:text.slice(0,4000),endeavorId,created:Date.now()}));
   if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:text.slice(0,4000),created:Date.now()}));
  }catch{status.textContent="Unable to carry the idea in this browser.";button.disabled=false;return}
  // The ordinary Continue action now creates or revises the durable plan,
  // without asking members to copy their vision into a second form.
  if(endeavorId&&window.SHANEEndeavorPlan?.create){
   try{await window.SHANEEndeavorPlan.create({vision:text,endeavorId})}
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
 group.append(conversation,continueConversation,planProgress,conversationReply,select,button,suggestion,workflow,planResume,revisionControl,status);nav.append(group);update();explainVision();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();