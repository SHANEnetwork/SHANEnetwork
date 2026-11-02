/* A single in-page network surface, reusing existing working SHANE applications. */
(()=>{"use strict";
function init(){
 const hub=document.getElementById("shane-idea-conversation"),reply=document.getElementById("shaneIdeaReply"),vision=document.getElementById("visionPrompt");if(!hub||!reply||!vision)return;
 const host=document.createElement("section");host.id="shane-connected-workspace";host.setAttribute("aria-label","Connected SHANE workspace");
 host.innerHTML='<style>#shane-connected-workspace{margin:20px 0;padding:18px;border:1px solid #dec7cc;border-radius:22px;background:linear-gradient(130deg,#fffaf4,#f9f0f7)}#shane-connected-workspace h3{margin:0 0 8px;color:#69465f;font:700 1.5rem Georgia,serif}#shane-connected-workspace p{color:#695767}#shane-connected-workspace .actions{display:flex;gap:8px;flex-wrap:wrap}#shane-connected-workspace button{background:#76516a;color:white;border:0;border-radius:24px;padding:10px 14px;cursor:pointer;font:600 14px system-ui}#shane-connected-workspace button[aria-pressed=true]{background:#b25e74}#shane-connected-workspace .frame{display:none;margin-top:15px;border:1px solid #e2cfd7;border-radius:14px;overflow:hidden;background:white}#shane-connected-workspace .frame[data-open=true]{display:block}#shane-connected-workspace iframe{display:block;width:100%;height:min(70vh,720px);min-height:420px;border:0}#shane-connected-workspace .frame a{display:inline-block;padding:9px 15px;color:#69465f;font-weight:600}#shane-connected-workspace button:focus-visible{outline:3px solid #d38b2e;outline-offset:3px}</style><h3>Your network, alongside our conversation</h3><p>Discover collaborators, revisit endeavors, and follow conversations without leaving your creative draft. SHANE keeps these existing tools connected in one place.</p><div class="actions" role="group" aria-label="Explore connected tools"><button type="button" data-page="network.html" data-kind="discover">Discover</button><button type="button" data-page="dashboard.html" data-kind="endeavors">My endeavors</button><button type="button" data-page="my-network.html" data-kind="messages">Connections & messages</button><button type="button" data-page="communities.html" data-kind="communities">Communities</button><button type="button" data-page="campaigns.html" data-kind="campaigns">Campaigns & events</button><button type="button" id="shane-connected-save-vision">Save vision as new endeavor</button><button type="button" id="shane-connected-plan">Plan creation from vision</button><button type="button" id="shane-connected-create" disabled>Create reviewed plan</button><button type="button" id="shane-connected-recent">Return to saved creations</button><button type="button" id="shane-connected-collaborations">My collaborations</button></div><div id="shane-connected-collaborations-list" aria-live="polite"></div><div id="shane-connected-creations" aria-live="polite"></div><p id="shane-connected-status" role="status">Choose a Network capability. Your website draft stays here.</p><div class="frame" id="shane-connected-frame"><a id="shane-connected-direct" href="network.html" target="_blank" rel="noopener">Open this workspace in a full tab</a><iframe title="Connected SHANE Network workspace" loading="lazy"></iframe></div>';
 hub.append(host);
 const frame=host.querySelector("iframe"),shell=host.querySelector(".frame"),direct=host.querySelector("#shane-connected-direct"),status=host.querySelector("#shane-connected-status");
 let active="";
 const CONTEXT="shane-active-endeavor-v1";
 function remember(id){try{if(typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id))sessionStorage.setItem(CONTEXT,JSON.stringify({id,updated:new Date().toISOString()}));else sessionStorage.removeItem(CONTEXT)}catch{}}
 function currentId(){try{const x=JSON.parse(sessionStorage.getItem(CONTEXT)||"null");return typeof x?.id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(x.id)?x.id:null}catch{return null}}
 let displayedId=currentId();
 function updateContext(event){if(!event?.detail||!Object.prototype.hasOwnProperty.call(event.detail,"id"))return;const announced=event.detail.id;const selectedBefore=currentId();if(announced===selectedBefore)return;if(announced!==null&&(typeof announced!=="string"||!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(announced)))return;remember(announced);const selected=currentId();if(active&&displayedId!==selected){const button=host.querySelector('button[data-kind="'+active+'"]');if(button){active="";open(button.dataset.kind,button.dataset.page);status.textContent="Switched the connected Network workspace to your selected endeavor.";}}}
 document.addEventListener("shane:endeavor-changed",updateContext);
 document.addEventListener("shane:active-endeavor-changed",updateContext);
 document.addEventListener("shane:endeavor-context-ready",event=>{if(!active)return;const announced=event?.detail?.endeavorId;if(announced&&announced!==currentId())return;const selected=currentId();if(selected===displayedId)return;const button=host.querySelector('button[data-kind="'+active+'"]');if(!button)return;active="";open(button.dataset.kind,button.dataset.page);status.textContent="Connected Network workspace synchronized with your saved endeavor.";});
 const accountSelect=document.getElementById("savedEndeavors");
 if(accountSelect){accountSelect.addEventListener("change",()=>{if(accountSelect.value)status.textContent="Selected an endeavor. Open it to make it the active Network context."})}
 function open(kind,page){
  if(active===kind){shell.dataset.open="false";active="";host.querySelectorAll("button[data-kind]").forEach(b=>b.setAttribute("aria-pressed","false"));status.textContent="Network workspace minimized. Your creative conversation remains ready.";return}
  let url=page;
  if(kind==="discover"){const words=(vision.value.trim()||reply.value.trim()).replace(/[^\p{L}\p{N}\s-]/gu," ").split(/\s+/).filter(w=>w.length>3&&!/^(with|from|this|that|website|create|build|want|have|would|could|should|about|people)$/i.test(w)).slice(0,4);if(words.length)url+="?q="+encodeURIComponent(words.join(" "))}
  const id=currentId();displayedId=id;if(id)url+=(url.includes("?")?"&":"?")+"endeavor="+encodeURIComponent(id);
  frame.src=url;direct.href=url;shell.dataset.open="true";active=kind;host.querySelectorAll("button[data-kind]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.kind===kind)));status.textContent="Showing "+kind+" inside your creative workspace. Your draft and conversation are unchanged.";
 }
 host.querySelectorAll("button[data-kind]").forEach(b=>{b.setAttribute("aria-pressed","false");b.addEventListener("click",()=>open(b.dataset.kind,b.dataset.page))});
 function openCollaborationLink(event,href,label){
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  const destination=new URL(href,window.location.href);
  if(destination.origin!==window.location.origin||!["workspace.html","members.html"].includes(destination.pathname.split("/").pop()))return;
  frame.src=destination.href;direct.href=destination.href;shell.dataset.open="true";active="collaboration";
  host.querySelectorAll("button[data-kind]").forEach(b=>b.setAttribute("aria-pressed","false"));
  status.textContent=label+" is open beside your conversation. Your vision and revision draft remain here.";
 }

 // Persist a new endeavor through the account-backed conversation store.
 // Creation is user-initiated, never inferred from merely typing an idea.
 const saveVision=host.querySelector("#shane-connected-save-vision");
 saveVision.addEventListener("click",async()=>{
  const idea=vision.value.trim()||reply.value.trim();
  if(idea.length<8){status.textContent="Describe your vision first, then save it as a new endeavor.";return}
  const store=window.SHANEConversationStore;
  if(typeof store?.beginEndeavor!=="function"){status.textContent="The account-backed creation service is not ready. Please try again shortly.";return}
  saveVision.disabled=true;
  status.textContent="Saving your new endeavor to your account…";
  try{
   const result=await store.beginEndeavor({vision:idea});
   const id=result?.id||result?.endeavor?.id;
   if(id&&currentId()!==id)document.dispatchEvent(new CustomEvent("shane:endeavor-changed",{detail:{id}}));
   status.textContent="Your new endeavor is saved to your account. Continue refining it here or open My endeavors.";
  }catch(error){status.textContent="Could not save the endeavor: "+(error?.message||"Please try again.");}
  finally{saveVision.disabled=false}
 });
 // Preview a multi-capability creation plan without writing or publishing.
 const planButton=host.querySelector("#shane-connected-plan");
 const createButton=host.querySelector("#shane-connected-create");
 let reviewedPlan=null;
 const invalidatePlan=()=>{reviewedPlan=null;createButton.disabled=true};
 vision.addEventListener("input",invalidatePlan);
 reply.addEventListener("input",invalidatePlan);
 document.addEventListener("shane:endeavor-changed",invalidatePlan);
 document.addEventListener("shane:active-endeavor-changed",invalidatePlan);
 createButton.addEventListener("click",async()=>{
  const plan=reviewedPlan;
  if(!plan||plan.endeavorId!==currentId()){invalidatePlan();status.textContent="Review a plan for your selected saved endeavor first.";return}
  const store=window.SHANEConversationStore;
  if(typeof store?.executeApprovedSequence!=="function"){status.textContent="Creation service is not ready.";return}
  if(!window.confirm("Create the reviewed items as saved drafts in this endeavor?"))return;
  if(plan!==reviewedPlan||plan.endeavorId!==currentId()){invalidatePlan();status.textContent="The endeavor changed. Review your plan again.";return}
  createButton.disabled=true;
  planButton.disabled=true;
  status.textContent="Creating the reviewed items…";
  try{
   const result=await store.executeApprovedSequence({steps:plan.steps,endeavorId:plan.endeavorId,approved:true});
   invalidatePlan();
   const count=result?.completed?.length||0;
   status.textContent=result?.complete&&result?.verified?"Created and verified "+count+" saved item(s). Open Return to saved creations to continue.":"Saved "+count+" item(s). "+(result?.error||result?.verificationError||"Review your saved work before continuing.");
   if(count&&result?.complete&&result?.verified&&typeof store?.recentCreations==="function")recentButton.click();
  }catch(error){invalidatePlan();status.textContent="Creation stopped: "+(error?.message||"Please review saved work.");}
  finally{planButton.disabled=false}
 });

 planButton.addEventListener("click",()=>{
  const idea=vision.value.trim()||reply.value.trim();
  const store=window.SHANEConversationStore;
  if(typeof store?.proposeCreationSequence!=="function"){status.textContent="The creation planner is not ready yet.";return}
  try{
   invalidatePlan();
   const proposal=store.proposeCreationSequence({vision:idea,endeavorId:currentId()});
   if(!proposal.ready||!proposal.steps?.length){status.textContent=proposal.reason||"Describe the website, community, event, or listing you want to create.";return}
   const names={"new-website":"website",community:"community",campaign:"campaign or event",listing:"listing"};
   const parts=proposal.steps.map(step=>names[step.type]||step.type);
   invalidatePlan();
   const endeavorId=currentId();
   if(endeavorId){reviewedPlan={endeavorId,steps:proposal.steps};createButton.disabled=false}
   status.textContent="Creation plan: "+parts.join(", ")+". Review your vision and save your endeavor before executing any creation. Nothing has been published.";
  }catch(error){status.textContent="Could not prepare the creation plan: "+(error?.message||"Please try again.");}
 });
 // Return to durable account-owned creations without leaving the conversation.
 const recentButton=host.querySelector("#shane-connected-recent");
 const recentArea=host.querySelector("#shane-connected-creations");
 recentButton.addEventListener("click",async()=>{
  const store=window.SHANEConversationStore;
  if(typeof store?.recentCreations!=="function"){status.textContent="Saved creations are not ready yet.";return}
  recentButton.disabled=true;
  status.textContent="Finding your saved creations…";
  try{
   const query=recentButton.dataset.search||"";
   delete recentButton.dataset.search;
   const items=query&&typeof store.findSavedCreations==="function"?await store.findSavedCreations({query,limit:20}):await store.recentCreations({limit:12});
   recentArea.replaceChildren();
   if(!items.length){status.textContent="No saved creations were found in this account yet.";return}
   const list=document.createElement("ul");
   for(const item of items){
    if(!item?.url||!item?.title)continue;
    const link=document.createElement("a");
    link.textContent=item.title+" ("+item.type+")";
    link.href=item.url;
    link.rel="noopener";
    link.addEventListener("click",event=>{
     if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
     const destination=new URL(link.href,window.location.href);
     if(destination.origin!==window.location.origin||!["builder.html","communities.html","campaigns.html","members.html"].includes(destination.pathname.split("/").pop()))return;
     event.preventDefault();frame.src=destination.href;direct.href=destination.href;shell.dataset.open="true";active="saved-creation";
     host.querySelectorAll("button[data-kind]").forEach(b=>b.setAttribute("aria-pressed","false"));
     status.textContent="Your saved "+item.type+" is open beside the conversation. Continue refining your vision here.";
    });
    const li=document.createElement("li");li.append(link);list.append(li);
   }
   recentArea.append(list);
   // An explicit revision stays in this conversation while the account-backed
   // service applies the requested change to the selected saved website.
   for(const item of items.filter(entry=>entry.type==="website"&&entry.id)){
    const button=document.createElement("button");
    button.type="button";
    button.textContent="Revise "+item.title;
    button.addEventListener("click",async()=>{
     const instruction=reply.value.trim()||vision.value.trim();
     if(instruction.length<3){status.textContent="Describe the website revision in the conversation first.";return}
     if(!window.confirm("Apply this revision to "+item.title+"? SHANE will update the saved website."))return;
     const service=window.SHANEConversationStore;
     if(typeof service?.reviseSite!=="function"){status.textContent="The website revision service is not ready.";return}
     button.disabled=true;
     status.textContent="Revising your saved website…";
     try{
      const result=await service.reviseSite({siteId:item.id,request:instruction});
      status.textContent=result?.saved?"Your website revision was saved. Reopen the website to review it.":"The revision was not confirmed saved. Review your website before trying again.";
     }catch(error){status.textContent="Website revision could not be saved: "+(error?.message||"Please try again.");}
     finally{button.disabled=false}
    });
    recentArea.append(button);
   }
   status.textContent="Your saved creations are ready. Choose one to continue working.";
  }catch(error){status.textContent="Could not retrieve saved creations: "+(error?.message||"Please try again.");}
  finally{recentButton.disabled=false}
 });
 // Rejoin accepted collaborations using the account-backed Network record.
 const collaborationButton=host.querySelector("#shane-connected-collaborations");
 const collaborationList=host.querySelector("#shane-connected-collaborations-list");
 collaborationButton.addEventListener("click",async()=>{
  const store=window.SHANEConversationStore;
  if(typeof store?.joinedCollaborations!=="function"){status.textContent="Collaboration records are not ready.";return}
  collaborationButton.disabled=true;
  status.textContent="Finding your accepted collaborations…";
  try{
   const items=await store.joinedCollaborations({limit:30});
   collaborationList.replaceChildren();
   if(!items.length){status.textContent="No accepted collaborations are available for this account yet. Use Discover to find people to work with.";return}
   const list=document.createElement("ul");
   for(const item of items){
    if(item.status!=="accepted"||!item.url?.startsWith("workspace.html?"))continue;
    const link=document.createElement("a");
    link.href=item.url;
    link.textContent=item.listingTitle+" ("+item.role+")";
    link.addEventListener("click",event=>openCollaborationLink(event,link.href,"Shared collaboration workspace"));
    const li=document.createElement("li");li.append(link);
    if(item.id&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(item.id)){const conversation=document.createElement("a");conversation.href="members.html?conversation="+encodeURIComponent(item.id)+"#collaborationSection";conversation.textContent="Private messages";conversation.addEventListener("click",event=>openCollaborationLink(event,conversation.href,"Private collaboration messages"));li.append(document.createTextNode(" · "),conversation)}
    list.append(li);
   }
   collaborationList.append(list);
   status.textContent="Your accepted collaborations are ready. Choose one to continue coordinating, or open Connections & messages alongside this conversation.";
  }catch(error){status.textContent="Could not load collaborations: "+(error?.message||"Please try again.");}
  finally{collaborationButton.disabled=false}
 });
 // Explicit requests in the creative prompt can bring the appropriate existing
 // workspace alongside the draft; ordinary brainstorming remains untouched.
 const guide=document.getElementById("visionGuide");
 if(guide)guide.addEventListener("click",()=>{
  const request=vision.value.trim().toLowerCase();
  if(!/^(?:please\s+)?(?:open|show|view|check|find|discover|browse|search\s+for|look\s+for)\b/.test(request))return;
  if(/^(?:please\s+)?(?:open|show|view|find|return\s+to|revisit)\s+(?:my\s+)?(?:saved\s+creations|previous\s+creations|created\s+websites)\b/.test(request)){recentButton.click();return}
  const named=request.match(/^(?:please\s+)?(?:find|show|open|return\s+to)\s+(?:my\s+)?(?:saved\s+)?(?:website|site|creation|project)\s+(?:named|called)\s+(.{2,100})$/);
  if(named){recentButton.dataset.search=named[1];recentButton.click();return}
  if(/^(?:please\s+)?(?:open|show|view|find|rejoin)\s+(?:my\s+)?(?:accepted\s+)?collaborations\b/.test(request)){collaborationButton.click();return}
  const routes=[
   {kind:"messages",match:/\b(?:open|show|view|check)\s+(?:my\s+)?(?:messages|inbox|conversations|connections)\b/},
   {kind:"endeavors",match:/\b(?:open|show|view|find)\s+(?:my\s+)?(?:saved\s+)?(?:projects|endeavors|websites)\b/},
   {kind:"discover",match:/\b(?:find|discover|search\s+for|look\s+for)\s+(?:some\s+)?(?:collaborators|partners|members|people\s+to\s+work\s+with)\b/},
   {kind:"communities",match:/\b(?:open|show|browse|find)\s+(?:my\s+)?communities\b/},
   {kind:"campaigns",match:/\b(?:open|show|browse|find)\s+(?:my\s+)?(?:campaigns|events)\b/}
  ];
  const route=routes.find(item=>item.match.test(request));
  if(route)document.dispatchEvent(new CustomEvent("shane:conversation-network-intent",{detail:{kind:route.kind}}));
 });
 // Conversation-driven workspace navigation reuses the same guarded in-page tools.
 // It does not send messages, publish listings, or alter a saved website.
 document.addEventListener("shane:conversation-network-intent",event=>{
  const kind=event?.detail?.kind;
  const button=typeof kind==="string"?host.querySelector('button[data-kind="'+kind.replace(/[^a-z-]/g,"")+'"]'):null;
  if(!button||button.dataset.kind!==kind)return;
  if(active!==kind)open(kind,button.dataset.page);
  else status.textContent="Your "+kind+" workspace is already open alongside this conversation.";
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();