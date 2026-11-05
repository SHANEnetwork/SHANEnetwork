/* Endeavor-centered dashboard continuity. A session ID is never proof of ownership. */
(()=>{"use strict";
const valid=id=>typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id);
const isActiveEndeavor=id=>{try{return JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id===id}catch{return false}};
async function init(){
 const status=document.getElementById("shaneActiveStatus"),host=document.getElementById("shaneActiveActions");
 if(!status||!host)return;
 host.replaceChildren();
 const requested=new URLSearchParams(location.search).get("endeavor");
 let stored=null;try{stored=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id}catch{}
 const id=valid(requested)?requested:valid(stored)?stored:null;
 if(!id){status.textContent="Open an existing endeavor from My Endeavors or describe a new one above.";return}
 status.textContent="Checking the selected endeavor against your account…";
 try{
  const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm");
  const sb=createClient("https://ufxzogeixdwvbpdypojb.supabase.co","sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB");
  const {data:{user},error:authError}=await sb.auth.getUser();
  if(authError)throw authError;
  if(!user){status.textContent="Sign in to continue this private endeavor.";return}
  const {data:item,error}=await sb.from("shane_endeavors").select("id,title,idea,linked_site_id").eq("id",id).eq("owner_id",user.id).maybeSingle();
  if(error)throw error;
  if(!item){status.textContent="This endeavor is not available to your account. Choose another from My Endeavors.";return}
  sessionStorage.setItem("shane-active-endeavor-v1",JSON.stringify({id:item.id,updated:Date.now()}));
  document.dispatchEvent(new CustomEvent("shane:active-endeavor-changed",{detail:{id:item.id}}));
  status.textContent="Continuing: "+(item.title||"Untitled endeavor")+". Your work remains private until you choose otherwise.";
  // Conversation remains the primary way to develop the endeavor. Reasoning is saved, not executed without approval.
  const conversation=document.createElement("section");conversation.id="shane-endeavor-conversation";conversation.style.cssText="margin:20px 0;padding:22px;border:1px solid #dec6c0;border-radius:20px;background:#fffaf3";
  const conversationTitle=document.createElement("h3");conversationTitle.textContent="Continue developing "+(item.title||"this endeavor")+" with SHANE";
  const conversationNote=document.createElement("p");conversationNote.textContent="Discuss the endeavor's direction, decisions, problems, and next creations. SHANE examines alternatives and saves its reasoning to this endeavor's history. Nothing is published or executed automatically.";
  const conversationForm=document.createElement("form");conversationForm.style.cssText="display:grid;gap:12px";
  const conversationInput=document.createElement("textarea");conversationInput.rows=4;conversationInput.required=true;conversationInput.minLength=8;conversationInput.maxLength=12000;conversationInput.placeholder="What should we develop, reconsider, or accomplish next for this endeavor?";conversationInput.style.cssText="width:100%;box-sizing:border-box;padding:12px;border-radius:12px";
  const conversationDraftKey="shane-endeavor-conversation-draft-v1:"+item.id;
  try{const draft=sessionStorage.getItem(conversationDraftKey);if(draft)conversationInput.value=draft.slice(0,12000)}catch{}
  conversationInput.addEventListener("input",()=>{try{sessionStorage.setItem(conversationDraftKey,conversationInput.value)}catch{}});
  const think=document.createElement("button");think.type="submit";think.textContent="Develop this endeavor with SHANE";
  const conversationStatus=document.createElement("p");conversationStatus.setAttribute("role","status");
  const conversationAnswer=document.createElement("div");conversationAnswer.setAttribute("aria-live","polite");conversationAnswer.style.whiteSpace="pre-wrap";
  conversationForm.append(conversationInput,think,conversationStatus);conversation.append(conversationTitle,conversationNote,conversationForm,conversationAnswer);host.append(conversation);
  conversationForm.addEventListener("submit",async event=>{
   event.preventDefault();if(!conversationInput.reportValidity())return;
   think.disabled=true;conversationStatus.textContent="Developing this endeavor and comparing possible paths…";
   try{
    if(!window.SHANEConversationStore?.reasonAndCreate)await import("./shane-conversation-store.js");
    const result=await window.SHANEConversationStore.reasonAndCreate({endeavorId:item.id,request:conversationInput.value.trim()});
    try{sessionStorage.removeItem(conversationDraftKey)}catch{}
    conversationAnswer.textContent=String(result.response||"No response returned.");
    const createNext=document.createElement("button");createNext.type="button";createNext.textContent="Use this conversation to create a private draft";
    createNext.addEventListener("click",()=>{const studio=document.getElementById("shane-endeavor-creation-studio");const draft=studio?.querySelector("textarea");if(!draft)return;draft.value=conversationInput.value.trim();draft.dispatchEvent(new Event("input",{bubbles:true}));studio.scrollIntoView({behavior:"smooth",block:"start"});draft.focus();});
    conversationAnswer.append(createNext);
    conversationStatus.textContent=result.selectionProvisional?"Reasoning saved to this endeavor. The comparison is provisional; no action was executed.":"Reasoning saved to this endeavor. No action was executed.";
    if(result.creationPlan){
     const plan=result.creationPlan;
     const steps=Array.isArray(plan)?plan:Array.isArray(plan.steps)?plan.steps:[];
     const review=document.createElement("section");review.style.cssText="padding:14px;margin-top:16px;border:1px solid #dec6c0;border-radius:14px";
     const heading=document.createElement("h4");heading.textContent="Review SHANE's proposed endeavor creations";review.append(heading);
     if(!steps.length){const note=document.createElement("p");note.textContent="SHANE proposed a plan but did not provide reviewable creation steps. No action was taken.";review.append(note)}
     else{
      const list=document.createElement("ol");
      for(const step of steps){const entry=document.createElement("li");entry.textContent=(step.type||"Unspecified creation")+": "+String(step.vision||"").slice(0,800);list.append(entry)}
      review.append(list);
      const preview=window.SHANEConversationStore.evaluateCreationPlan({steps});
      const validation=document.createElement("p");validation.textContent=preview.ready?"These steps are ready to save as a private endeavor plan. Saving does not create or publish them.":"This proposal needs more information before it can be saved: "+(preview.reason||"Incomplete steps");review.append(validation);
      const save=document.createElement("button");save.type="button";save.textContent="Save reviewed plan to this endeavor";save.disabled=!preview.ready;
      const saveStatus=document.createElement("p");saveStatus.setAttribute("role","status");review.append(save,saveStatus);
      save.addEventListener("click",async()=>{
       save.disabled=true;saveStatus.textContent="Saving the reviewed plan to this endeavor…";
       try{const result=await window.SHANEConversationStore.saveCreationPlan({endeavorId:item.id,steps});if(!result.saved)throw Error("Plan save not confirmed.");saveStatus.textContent="Plan saved to this endeavor. No creations were executed.";document.dispatchEvent(new CustomEvent("shane:endeavor-reasoning-saved",{detail:{endeavorId:item.id}}))}
       catch(error){saveStatus.textContent="Could not save plan: "+String(error?.message||error);save.disabled=false}
      });
     }
     conversationAnswer.append(review);
    }
    document.dispatchEvent(new CustomEvent("shane:endeavor-reasoning-saved",{detail:{endeavorId:item.id}}));
   }catch(error){conversationStatus.textContent="Could not confirm the reasoning was saved: "+String(error?.message||error)+". Your request remains available."}
   finally{think.disabled=false}
  });
  const actions=[
   ["Continue the endeavor","my-endeavors.html?endeavor="+encodeURIComponent(id)],
   ["Coordinate work","workspace.html?endeavor="+encodeURIComponent(id)],
   ["Find collaborators","members.html?endeavor="+encodeURIComponent(id)],
   ["Develop a community","communities.html?endeavor="+encodeURIComponent(id)],
   ["Organize an event","campaigns.html?endeavor="+encodeURIComponent(id)],
   [item.linked_site_id?"Open endeavor website":"Create its website",item.linked_site_id?"builder.html?site="+encodeURIComponent(item.linked_site_id)+"&endeavor="+encodeURIComponent(id):"builder.html?endeavor="+encodeURIComponent(id)+"#vision-first"]
  ];
  for(const [label,url] of actions){const link=document.createElement("a");link.href=url;link.textContent=label;host.append(link)}
  const studio=document.createElement("section");studio.id="shane-endeavor-creation-studio";studio.style.cssText="margin-top:20px;padding:22px;border:1px solid #dec6c0;border-radius:20px;background:#fffaf3";
  const heading=document.createElement("h3");heading.textContent="Create something for this endeavor";
  const explanation=document.createElement("p");explanation.textContent="Describe what this endeavor needs next. SHANE creates a private, saved draft linked to this endeavor's ongoing work. You decide whether to publish or invite anyone.";
  const purpose=document.createElement("p");purpose.textContent="Endeavor purpose: "+String(item.idea||"").slice(0,1800);studio.append(purpose);
  const form=document.createElement("form");form.style.cssText="display:grid;gap:12px";
  const choice=document.createElement("select");choice.setAttribute("aria-label","What should SHANE create?");
  for(const [value,label] of [["listing","Network opportunity or collaboration listing"],["community","Community or association"],["campaign","Event or campaign"],...(item.linked_site_id?[]:[["new-website","Website for this endeavor"]])]){const option=document.createElement("option");option.value=value;option.textContent=label;choice.append(option)}
  if(item.linked_site_id){const option=document.createElement("option");option.value="website";option.textContent="Revise this endeavor\u0027s primary website";choice.append(option)}
  const request=document.createElement("textarea");request.rows=4;request.maxLength=12000;request.required=true;request.minLength=8;request.placeholder="Describe the outcome you want, the people it serves, and what should be created…";request.style.cssText="width:100%;box-sizing:border-box;padding:12px;border-radius:12px";
  const usePurpose=document.createElement("button");usePurpose.type="button";usePurpose.textContent="Create from this endeavor\u0027s original vision";usePurpose.addEventListener("click",()=>{request.value=String(item.idea||"").slice(0,12000);request.dispatchEvent(new Event("input",{bubbles:true}));request.focus()});
  const historyRecoveryKey="shane-endeavor-history-recovery-v1:"+item.id;
  const historyRecovery=document.createElement("div");historyRecovery.setAttribute("role","status");studio.append(historyRecovery);
  async function recoverHistoryRecord(record){
   if(!window.SHANEConversationStore?.saveTurn)await import("./shane-conversation-store.js");
   const account=await window.SHANEConversationStore.connectedUser();
   if(!account)throw Error("Sign in before recovering endeavor history.");
   if(record.endeavorId!==item.id||!valid(record.id))throw Error("Recovery record does not belong to this endeavor.");
   const saved=await window.SHANEConversationStore.recoverVerifiedCreationHistory({endeavorId:item.id,record});
   if(!saved?.saved)throw Error("History was not confirmed.");
   try{sessionStorage.removeItem(historyRecoveryKey)}catch{}
   try{const queue=JSON.parse(sessionStorage.getItem("shane-endeavor-history-recovery-queue-v1:"+item.id)||"[]");if(Array.isArray(queue))sessionStorage.setItem("shane-endeavor-history-recovery-queue-v1:"+item.id,JSON.stringify(queue.filter(entry=>entry?.id!==record.id)))}catch{}
   document.dispatchEvent(new CustomEvent("shane:endeavor-creation-saved",{detail:{endeavorId:item.id,type:record.type,artifactId:record.id}}));
  }
  function showHistoryRecovery(record){
   historyRecovery.replaceChildren();
   const message=document.createElement("p");message.textContent="A saved creation still needs its endeavor-history record. No new creation is necessary.";
   const retry=document.createElement("button");retry.type="button";retry.textContent="Recover saved creation history";
   historyRecovery.append(message,retry);
   retry.addEventListener("click",async()=>{
    retry.disabled=true;message.textContent="Recording the existing creation…";
    try{await recoverHistoryRecord(record);historyRecovery.textContent="Saved creation recorded in this endeavor's history."}
    catch(error){retry.disabled=false;message.textContent="History recovery not confirmed: "+String(error?.message||error)}
   });
  }
  try{const pending=JSON.parse(sessionStorage.getItem(historyRecoveryKey)||"null");if(pending?.endeavorId===item.id&&valid(pending.id))showHistoryRecovery(pending)}catch{}
  // Multiple creations can occur before a missing history entry is recovered.
  // Preserve older recovery records instead of replacing them with the newest one.
  const historyQueueKey="shane-endeavor-history-recovery-queue-v1:"+item.id;
  const readHistoryQueue=()=>{try{const value=JSON.parse(sessionStorage.getItem(historyQueueKey)||"[]");return Array.isArray(value)?value.filter(record=>record?.endeavorId===item.id&&valid(record.id)):[]}catch{return []}};
  const writeHistoryQueue=queue=>{try{if(queue.length)sessionStorage.setItem(historyQueueKey,JSON.stringify(queue));else sessionStorage.removeItem(historyQueueKey)}catch{}};
  const queueHistoryRecord=record=>{const queue=readHistoryQueue().filter(entry=>entry.id!==record.id);queue.push(record);writeHistoryQueue(queue);};
  const queuedRecovery=document.createElement("div");studio.append(queuedRecovery);
  function renderQueuedRecovery(){
   queuedRecovery.replaceChildren();
   const queue=readHistoryQueue();
   if(!queue.length)return;
   const heading=document.createElement("p");heading.textContent=queue.length+" saved creation(s) still need endeavor-history recovery.";queuedRecovery.append(heading);
   for(const record of queue){
    const row=document.createElement("div"),label=document.createElement("span"),retry=document.createElement("button");
    label.textContent=(record.type||"Creation")+" · "+String(record.vision||"").slice(0,110)+" ";
    retry.type="button";retry.textContent="Recover this creation's history";
    row.append(label,retry);queuedRecovery.append(row);
    retry.addEventListener("click",async()=>{
     retry.disabled=true;
     try{await recoverHistoryRecord(record);writeHistoryQueue(readHistoryQueue().filter(entry=>entry.id!==record.id));renderQueuedRecovery()}
     catch(error){retry.disabled=false;label.textContent="History recovery failed: "+String(error?.message||error)+" "}
    });
   }
  }
  renderQueuedRecovery();
  const draftKey="shane-endeavor-creation-draft-v1:"+item.id;
  let pendingDeadline="";
  try{const pending=JSON.parse(sessionStorage.getItem(draftKey)||"null");if(pending&&typeof pending.vision==="string"){request.value=pending.vision.slice(0,12000);if([...choice.options].some(option=>option.value===pending.type))choice.value=pending.type;if(typeof pending.deadline==="string")pendingDeadline=pending.deadline}}catch{}
  const preserveDraft=()=>{try{sessionStorage.setItem(draftKey,JSON.stringify({vision:request.value,type:choice.value,deadline:deadline.value,updatedAt:Date.now()}))}catch{}};
  request.addEventListener("input",preserveDraft);
  choice.addEventListener("change",preserveDraft);
  const deadline=document.createElement("input");deadline.type="datetime-local";deadline.setAttribute("aria-label","Interest deadline for event or campaign");deadline.value=pendingDeadline;deadline.hidden=choice.value!=="campaign";deadline.required=choice.value==="campaign";deadline.addEventListener("input",preserveDraft);
  choice.addEventListener("change",()=>{deadline.hidden=choice.value!=="campaign";deadline.required=choice.value==="campaign"});
  const create=document.createElement("button");create.type="submit";create.textContent="Create and save private draft";
  const outcome=document.createElement("p");outcome.setAttribute("role","status");
  form.append(choice,request,usePurpose,deadline,create,outcome);studio.append(heading,explanation,form);host.append(studio);
  // Recover the original saved website instead of creating a duplicate if linking failed.
  let orphanedWebsite=null;
  try{const prior=JSON.parse(sessionStorage.getItem("shane-website-link-recovery-v1:"+item.id)||sessionStorage.getItem("shane-last-created-artifact-v1")||"null");if(prior?.type==="new-website"&&prior.endeavorId===item.id&&prior.endeavorLink?.linked===false&&valid(prior.id))orphanedWebsite=prior}catch{}
  if(orphanedWebsite&&!item.linked_site_id){
   const pendingOption=choice.querySelector('option[value="new-website"]');
   if(pendingOption){pendingOption.disabled=true;pendingOption.textContent="Reconnect existing website before creating another";if(choice.value==="new-website"){choice.value="listing";choice.dispatchEvent(new Event("change"))}}
   const reconnect=document.createElement("button");reconnect.type="button";reconnect.textContent="Reconnect saved website to this endeavor";
   const reconnectStatus=document.createElement("p");reconnectStatus.setAttribute("role","status");reconnectStatus.textContent="A website was saved but its endeavor connection was not confirmed. Reconnect that existing website before creating another.";
   studio.append(reconnectStatus,reconnect);
   reconnect.addEventListener("click",async()=>{
    reconnect.disabled=true;reconnectStatus.textContent="Verifying website ownership and reconnecting…";
    try{
     if(!window.SHANEConversationStore?.repairEndeavorWebsiteLink)await import("./shane-conversation-store.js");
     const result=await window.SHANEConversationStore.repairEndeavorWebsiteLink({endeavorId:item.id,siteId:orphanedWebsite.id});
     if(!result.linked)throw Error("The link was not confirmed.");
     item.linked_site_id=orphanedWebsite.id;
     const option=choice.querySelector('option[value="new-website"]');
     if(option){option.disabled=false;option.value="website";option.textContent="Revise this endeavor's primary website";}
     // Reconnecting an existing artifact must not erase unrelated unfinished creation work.
     try{const draft=JSON.parse(sessionStorage.getItem(draftKey)||"null");if(draft?.type==="new-website")sessionStorage.removeItem(draftKey)}catch{}
     sessionStorage.removeItem("shane-website-link-recovery-v1:"+item.id);
     try{
      const saved=await window.SHANEConversationStore.saveTurn(JSON.stringify({version:1,endeavorId:item.id,id:orphanedWebsite.id,type:"new-website",changeKind:"link-recovery",url:orphanedWebsite.url||"builder.html?site="+encodeURIComponent(orphanedWebsite.id)+"&endeavor="+encodeURIComponent(item.id),vision:String(orphanedWebsite.vision||"").slice(0,1200),saved:true,endeavorLinked:true}),{page:"shane-dashboard",kind:"creation-summary",endeavorId:item.id});
      if(!saved?.saved)reconnectStatus.textContent="Website connected. Its history record still needs verification.";
     }catch(error){reconnectStatus.textContent="Website connected, but its history record could not be confirmed."}
     try{const latest=JSON.parse(sessionStorage.getItem("shane-last-created-artifact-v1")||"null");if(latest?.id===orphanedWebsite.id)sessionStorage.removeItem("shane-last-created-artifact-v1")}catch{}
     if(reconnectStatus.textContent.includes("history record")){
      const retry=document.createElement("button");retry.type="button";retry.textContent="Retry saving website connection to endeavor history";
      studio.append(retry);
      retry.addEventListener("click",async()=>{
       retry.disabled=true;
       try{
        const saved=await window.SHANEConversationStore.saveTurn(JSON.stringify({version:1,endeavorId:item.id,id:orphanedWebsite.id,type:"new-website",changeKind:"link-recovery",url:orphanedWebsite.url||"builder.html?site="+encodeURIComponent(orphanedWebsite.id)+"&endeavor="+encodeURIComponent(item.id),vision:String(orphanedWebsite.vision||"").slice(0,1200),saved:true,endeavorLinked:true}),{page:"shane-dashboard",kind:"creation-summary",endeavorId:item.id});
        if(!saved?.saved)throw Error("History was not confirmed.");
        reconnectStatus.textContent="Website connected and recorded in this endeavor's history.";
        retry.remove();
        document.dispatchEvent(new CustomEvent("shane:endeavor-creation-saved",{detail:{endeavorId:item.id,type:"website",artifactId:orphanedWebsite.id}}));
       }catch(error){retry.disabled=false;reconnectStatus.textContent="Website remains connected. History retry failed: "+String(error?.message||error)}
      });
     }else reconnectStatus.textContent="Your existing website is now linked to this endeavor. No duplicate was created.";
     reconnect.remove();
     document.dispatchEvent(new CustomEvent("shane:endeavor-creation-saved",{detail:{endeavorId:item.id,type:"website",artifactId:item.linked_site_id,changeKind:"link-recovery",endeavorLinked:true}}));
    }catch(error){reconnectStatus.textContent="Website connection was not confirmed: "+String(error?.message||error);reconnect.disabled=false}
   });
  }
  // A failed optional listing must not strand the saved endeavor outside its conversation.
  let pendingListing=null;
  try{const pending=JSON.parse(sessionStorage.getItem("shane-endeavor-listing-pending-v1")||"null");if(pending?.endeavorId===item.id&&typeof pending.vision==="string")pendingListing=pending}catch{}
  if(pendingListing){
   const retry=document.createElement("button");retry.type="button";retry.textContent="Retry this endeavor's private Network listing";
   const retryStatus=document.createElement("p");retryStatus.setAttribute("role","status");
   retryStatus.textContent="Your endeavor is saved. Its optional Network listing was not confirmed; you can continue developing the endeavor or retry that listing.";
   studio.append(retryStatus,retry);
   retry.addEventListener("click",async()=>{
    retry.disabled=true;retryStatus.textContent="Checking for an existing listing and retrying the private draft…";
    try{
     if(!window.SHANEConversationStore?.establishEndeavor)await import("./shane-conversation-store.js");
     const result=await window.SHANEConversationStore.establishEndeavor({vision:pendingListing.vision,endeavorId:item.id,approved:true});
     if(!result.networkDraftSaved)throw Error(result.error||"The Network listing is still pending.");
     sessionStorage.removeItem("shane-endeavor-listing-pending-v1");
     retryStatus.textContent="The endeavor's Network listing is saved. No publication or invitations occurred.";
     retry.remove();document.dispatchEvent(new CustomEvent("shane:endeavor-creation-saved",{detail:{endeavorId:item.id,type:"listing",artifactId:result.listingId}}));
    }catch(error){retryStatus.textContent="Your endeavor remains saved. The listing could not be confirmed: "+String(error?.message||error);retry.disabled=false}
   });
  }
  // Show actual account-authorized collaboration records, not guessed matches.
  const collaboration=document.createElement("section");collaboration.id="shane-endeavor-collaboration";collaboration.style.cssText="margin-top:18px;padding:20px;border:1px solid #dec6c0;border-radius:18px;background:#fffaf3";
  const collabTitle=document.createElement("h3");collabTitle.textContent="People and opportunities connected to this endeavor";
  const collabStatus=document.createElement("p");collabStatus.setAttribute("role","status");
  const collabList=document.createElement("div");
  const collabRefresh=document.createElement("button");collabRefresh.type="button";collabRefresh.textContent="Refresh connections";
  collaboration.append(collabTitle,collabStatus,collabList,collabRefresh);host.append(collaboration);
  async function refreshConnections(){
   collabRefresh.disabled=true;collabStatus.textContent="Checking saved opportunities and accepted collaborations…";collabList.replaceChildren();
   try{
    if(!window.SHANEConversationStore?.collaborationContext)await import("./shane-conversation-store.js");
    const context=await window.SHANEConversationStore.collaborationContext({endeavorId:item.id,limit:20});
    if(context.endeavorId!==item.id||!context.confirmed)throw Error("Could not verify the endeavor's connections.");
    collabStatus.textContent=context.listings.length+" saved Network listing(s), "+context.collaborations.length+" accepted collaboration(s).";
    if(context.listingsComplete===false||context.requestsComplete===false)collabStatus.textContent+=" More endeavor connections may exist beyond the current retrieval limit.";
    for(const listing of context.listings){const p=document.createElement("p");p.textContent="Opportunity: "+listing.title+" ";const link=document.createElement("a");link.href="members.html?listing="+encodeURIComponent(listing.id)+"&endeavor="+encodeURIComponent(item.id);link.textContent="Review listing";p.append(link);collabList.append(p)}
    for(const connection of context.collaborations){const p=document.createElement("p");p.textContent="Accepted collaboration for "+connection.listingTitle+" ";const link=document.createElement("a");link.href=connection.url;link.textContent="Coordinate together";p.append(link);collabList.append(p)}
    if(!context.listings.length){const p=document.createElement("p");p.textContent="No Network listings are attached yet. Create a private opportunity above to begin.";collabList.append(p)}
   }catch(error){collabStatus.textContent="Could not load verified connections: "+String(error?.message||error)}
   finally{collabRefresh.disabled=false}
  }
  collabRefresh.addEventListener("click",()=>void refreshConnections());
  document.addEventListener("shane:endeavor-creation-saved",event=>{if(event.detail?.endeavorId===item.id)void refreshConnections()});
  void refreshConnections();
  // A single read-only account-backed view of this endeavor's evolution.
  const timeline=document.createElement("section");timeline.id="shane-endeavor-evolution";timeline.style.cssText="margin-top:18px;padding:20px;border:1px solid #dec6c0;border-radius:18px;background:#fffaf3";
  const evolutionTitle=document.createElement("h3");evolutionTitle.textContent="Your endeavor's continuing story";
  const evolutionStatus=document.createElement("p");evolutionStatus.setAttribute("role","status");
  const evolutionContent=document.createElement("div");
  const evolutionRefresh=document.createElement("button");evolutionRefresh.type="button";evolutionRefresh.textContent="Refresh endeavor history";
  timeline.append(evolutionTitle,evolutionStatus,evolutionContent,evolutionRefresh);host.append(timeline);
  function section(label,items,render){
   const wrap=document.createElement("section"),heading=document.createElement("h4");heading.textContent=label;wrap.append(heading);
   if(!items.length){const empty=document.createElement("p");empty.textContent="Nothing recorded here yet.";wrap.append(empty)}
   for(const entry of items){const row=document.createElement("p");render(row,entry);wrap.append(row)}
   evolutionContent.append(wrap);
  }
  async function refreshEvolution(){
   evolutionRefresh.disabled=true;evolutionStatus.textContent="Reading this endeavor's saved creations, decisions and ongoing work…";evolutionContent.replaceChildren();
   try{
    if(!window.SHANEConversationStore?.endeavorSnapshot)await import("./shane-conversation-store.js");
    const snapshot=await window.SHANEConversationStore.endeavorSnapshot({endeavorId:item.id});
    if(snapshot.endeavor?.id!==item.id)throw Error("The returned history does not match this endeavor.");
    const available=snapshot.availability||{};
    evolutionStatus.textContent="Saved endeavor: "+(snapshot.endeavor.title||"Untitled")+". This view includes only records SHANE could verify.";
    if(!available.creations||!available.history||!available.collaborations){const note=document.createElement("p");note.textContent="Some history sources are temporarily unavailable; the view may be incomplete.";evolutionContent.append(note)}
    section("Creations belonging to this endeavor",snapshot.creations||[],(row,creation)=>{
     row.append(document.createTextNode((creation.type||"Creation")+": "+(creation.title||"Untitled")+" "));
     if(creation.url){const link=document.createElement("a");link.href=creation.url;link.textContent="Open";row.append(link)}
    });
    section("Accepted collaborators",snapshot.collaborations||[],(row,connection)=>{
     row.append(document.createTextNode(connection.listingTitle||"Collaboration"));
     if(connection.url){const link=document.createElement("a");link.href=connection.url;link.textContent=" Coordinate";row.append(link)}
    });
    const plan=snapshot.creationPlan;
    if(plan){const p=document.createElement("p");p.textContent="Saved creation plan: "+plan.completed.length+" completed step(s), "+(plan.remaining===null?"unknown":plan.remaining)+" remaining.";evolutionContent.append(p);
     const steps=document.createElement("p");steps.textContent="Creation sequence: "+plan.types.join(", ")+(plan.nextStep?". Next: "+plan.nextStep:"");evolutionContent.append(steps);
     for(const receipt of plan.completed){const line=document.createElement("p");line.textContent="Confirmed creation: "+receipt.type+" ";if(receipt.url){const link=document.createElement("a");link.href=receipt.url;link.textContent="Open";line.append(link)}evolutionContent.append(line)}
    }
    if(plan&&plan.remaining>0){
     const review=document.createElement("section");review.style.cssText="margin-top:12px;padding:14px;border:1px solid #dec6c0;border-radius:14px";
     const heading=document.createElement("h4");heading.textContent="Review the endeavor's unfinished work";review.append(heading);
     const details=document.createElement("ol"),note=document.createElement("p"),approve=document.createElement("button");approve.type="button";approve.textContent="Approve remaining private creations";approve.disabled=true;
     review.append(details,note,approve);evolutionContent.append(review);
     try{
      const store=window.SHANEConversationStore;
      const saved=await store.loadCreationPlan({endeavorId:item.id});
      if(!saved?.steps?.length)throw Error("The saved plan has no steps.");
      if(saved.endeavorId!==item.id)throw Error("The saved plan belongs to another endeavor.");
      const check=store.evaluateCreationPlan({steps:saved.steps});
      saved.steps.forEach((step,index)=>{const li=document.createElement("li");li.textContent=(index<plan.completed.length?"Completed: ":"Pending: ")+(step.type||"Creation")+" | "+String(step.vision||"").slice(0,500);details.append(li)});
      if(!check.ready)note.textContent="The plan needs revision: "+(check.reason||"Incomplete creation details");
      else if(!isActiveEndeavor(item.id))note.textContent="Creation is paused until the active-endeavor confirmation is available. Your plan remains saved.";
      else{
       note.textContent="Only private drafts will be created. Nothing will be published or invitations sent.";approve.disabled=false;
       approve.addEventListener("click",async()=>{
        approve.disabled=true;note.textContent="Checking prior receipts and creating approved drafts…";
        try{const result=await store.executeApprovedSequence({endeavorId:item.id,steps:saved.steps,approved:true});note.textContent=result.complete&&result.verified?"All steps completed and verified.":"Some steps remain unfinished. Confirmed progress is retained.";await refreshConnections();await refreshEvolution()}
        catch(error){note.textContent="Execution stopped: "+String(error?.message||error)+". Review the saved progress before trying again.";approve.disabled=false}
       });
      }
     }catch(error){note.textContent="Unable to inspect the saved plan: "+String(error?.message||error)}
    }
    if(snapshot.planError){const p=document.createElement("p");p.textContent="Saved plan unavailable: "+snapshot.planError;evolutionContent.append(p)}
    section("Recent conversation and creation history",snapshot.recentHistory||[],(row,entry)=>{
     const time=entry.at?new Date(entry.at):null;
     let message=entry.text||"";
     if(["reasoning-cycle","creation-plan","creation-outcome"].includes(entry.kind)){
      try{const data=JSON.parse(message);
       if(entry.kind==="reasoning-cycle")message="Request: "+String(data.request||"").slice(0,260)+" | SHANE: "+String(data.selectedResponse||data.response||"Analysis saved").slice(0,440);
       else if(entry.kind==="creation-plan")message="Reviewed plan: "+(Array.isArray(data.steps)?data.steps.map(step=>step.type).join(", "):"Saved steps");
       else message="Creation outcome: "+(data.complete?"complete":"in progress")+", "+(Array.isArray(data.receipts)?data.receipts.length:0)+" confirmed receipts";
      }catch{message="Saved "+entry.kind+" record"}
     }
     row.textContent=(time&&!Number.isNaN(time.getTime())?time.toLocaleDateString()+" · ":"")+(entry.kind||"Update")+": "+message;
    });
   }catch(error){evolutionStatus.textContent="Unable to load this endeavor's history: "+String(error?.message||error)}
   finally{evolutionRefresh.disabled=false}
  }
  evolutionRefresh.addEventListener("click",()=>void refreshEvolution());
  document.addEventListener("shane:endeavor-reasoning-saved",event=>{if(event.detail?.endeavorId===item.id)void refreshEvolution()});
  document.addEventListener("shane:endeavor-creation-saved",event=>{if(event.detail?.endeavorId===item.id)void refreshEvolution()});
  void refreshEvolution();

  form.addEventListener("submit",async event=>{
   event.preventDefault();if(!request.reportValidity()||!deadline.reportValidity())return;
   create.disabled=true;outcome.textContent="Creating and saving for "+(item.title||"this endeavor")+"…";
   try{
    if(!window.SHANEConversationStore?.executeVision)await import("./shane-conversation-store.js");
    const store=window.SHANEConversationStore;if(!store?.executeVision)throw Error("Creation engine unavailable.");
    const submittedType=choice.value;
    const submittedVision=request.value.trim();
    const result=await store.executeVision({type:submittedType,vision:submittedVision,endeavorId:item.id,siteId:submittedType==="website"?item.linked_site_id:undefined,deadline:submittedType==="campaign"?deadline.value:undefined});
    outcome.textContent=submittedType==="website"?"Your endeavor website revision was saved. Publication status was not changed here.":"Saved privately for your endeavor. Nothing was published."; 
    if(submittedType==="new-website"&&!result.endeavorLink?.linked)outcome.textContent="The website was saved, but its connection to this endeavor is not confirmed.";
    if(result.endeavorLink?.reason)outcome.textContent=result.endeavorLink.reason;
    if(result.historySaved===false){
     const pendingRecord={version:1,endeavorId:item.id,id:result.id,type:submittedType,changeKind:result.receipt?.changeKind||"creation",url:result.url||null,vision:submittedVision.slice(0,1200),saved:true,endeavorLinked:submittedType==="new-website"?result.endeavorLink?.linked===true:true};
     try{sessionStorage.setItem(historyRecoveryKey,JSON.stringify(pendingRecord))}catch{}
     queueHistoryRecord(pendingRecord);renderQueuedRecovery();
     showHistoryRecovery(pendingRecord);
     outcome.append(" The creation was saved, but its conversation-history record could not be confirmed.");
     const retryMemory=document.createElement("button");retryMemory.type="button";retryMemory.textContent="Save this creation to endeavor history";
     outcome.append(" ",retryMemory);
     retryMemory.addEventListener("click",async()=>{
      retryMemory.disabled=true;
      try{
       const record={version:1,endeavorId:item.id,id:result.id,type:submittedType,changeKind:result.receipt?.changeKind||"creation",url:result.url||null,vision:submittedVision.slice(0,1200),saved:true,endeavorLinked:submittedType==="new-website"?result.endeavorLink?.linked===true:true};
       await recoverHistoryRecord(record);
       retryMemory.replaceWith(document.createTextNode("Creation recorded in endeavor history."));
       historyRecovery.replaceChildren();
       document.dispatchEvent(new CustomEvent("shane:endeavor-creation-saved",{detail:{endeavorId:item.id,type:submittedType,artifactId:result.id}}));
      }catch(error){retryMemory.disabled=false;outcome.append(" History retry failed: "+String(error?.message||error))}
     });
    }
    if(submittedType==="new-website"&&result.endeavorLink?.linked&&result.id){
     item.linked_site_id=result.id;
     const websiteOption=choice.querySelector('option[value="new-website"]');
     if(websiteOption){websiteOption.value="website";websiteOption.textContent="Revise this endeavor\u0027s primary website";}
     request.value="";request.placeholder="Describe what should change on this endeavor\u0027s saved website…";
    }
    if(result.url){const link=document.createElement("a");link.href=result.url;link.textContent="Open saved creation";outcome.append(" ",link)}
    // Keep the original request available when a website exists but its endeavor link failed.
    if(submittedType!=="new-website"||result.endeavorLink?.linked===true){try{sessionStorage.removeItem(draftKey)}catch{}}
    document.dispatchEvent(new CustomEvent("shane:endeavor-creation-saved",{detail:{endeavorId:item.id,type:submittedType,artifactId:result.id,changeKind:result.receipt?.changeKind||"creation",endeavorLinked:result.endeavorLink?.linked??null}}));
   }catch(error){outcome.textContent="Creation was not confirmed: "+String(error?.message||error)+". Your description remains available."}
   finally{create.disabled=false}
  });

 }catch(error){status.textContent="Unable to verify your endeavor right now. No changes were made.";console.warn("SHANE endeavor continuity:",error)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>void init(),{once:true});else void init();
})();
