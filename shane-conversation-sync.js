/* Non-destructive save and resume for SHANE's conversational vision.
   Private autosave; owner-scoped Supabase RLS; never publishes a site. */
(function(){
"use strict";
const key="shane_last_private_endeavor_v1",siteKey="shane_private_site_for_endeavor_v1";
function get(id){return document.getElementById(id)}
function snapshot(){let result=null;const listener=e=>{result=e.detail};document.addEventListener("shane:conversation-snapshot",listener,{once:true});document.dispatchEvent(new Event("shane:conversation-export"));document.removeEventListener("shane:conversation-snapshot",listener);return result}
function editorSnapshot(){let result=null;const listener=e=>{result=e.detail?.content||null};document.addEventListener("shane:editor-snapshot",listener,{once:true});document.dispatchEvent(new Event("shane:editor-export"));document.removeEventListener("shane:editor-snapshot",listener);return result}
function status(text){const el=get("shaneContinuityStatus");if(el)el.textContent=text}
let saveInProgress=false;
const revisionKey="shane_endeavor_revision_v1";
function observedRevision(id){try{const entry=JSON.parse(sessionStorage.getItem(revisionKey)||"null");return entry?.id===id&&Number.isInteger(entry.revision)?entry.revision:null}catch{return null}}
function rememberRevision(id,revision){if(id&&Number.isInteger(revision))sessionStorage.setItem(revisionKey,JSON.stringify({id,revision}))}
async function save(){
 if(saveInProgress){status("Your endeavor is already being saved. Please wait for it to finish.");return false}
 const client=window.SHANEAuthenticatedClient;
 if(!client){status("The account connection is not ready. Try again shortly.");return false}
 const snap=snapshot();if(!snap){status("The conversation is not ready.");return false}
 const vision=snap.turns.filter(t=>t.role==="you").map(t=>t.text).join("\n");
 if(!vision.trim()){status("Describe your idea to SHANE before saving the conversation.");return false}
 const inferred=window.SHANEVision.interpret(vision);
 const previousSpec=window.SHANECurrentComposition?.spec;
 if(previousSpec?.title&&inferred.spec.title==="My Endeavor")inferred.spec.title=previousSpec.title;
 const draft=editorSnapshot();
 const title=String(draft?.business||draft?.name||inferred.spec.title||"My Endeavor").trim();
 const existing=sessionStorage.getItem(key);
 saveInProgress=true;
 let savedState=null;
 try{if(existing)savedState=await window.SHANEEndeavorStore.load(client,existing)}catch(e){saveInProgress=false;status("Unable to verify your previous creation: "+e.message);return false}
 if(existing&&!savedState){saveInProgress=false;status("This saved creation is unavailable in the signed-in account. Your conversation was not overwritten.");return false}
 if(existing){const expected=observedRevision(existing);if(expected===null){saveInProgress=false;status("Reopen this saved endeavor before editing so SHANE can protect changes from other sessions.");return false}if(savedState.revision!==expected){saveInProgress=false;status("This endeavor changed in another session. Reopen it before saving to protect newer work.");return false}}
 if(savedState?.spec?.shaneOrganizationId)inferred.spec.shaneOrganizationId=savedState.spec.shaneOrganizationId;
 const button=get("shaneKeepConversation");if(button)button.disabled=true;
 try{
  const result=await window.SHANEEndeavorStore.save(client,{title,vision,spec:inferred.spec,conversation:snap.turns,endeavorId:existing||undefined,expectedRevision:existing?observedRevision(existing):undefined});
  sessionStorage.setItem(key,result.id);
  rememberRevision(result.id,result.revision);
  // Network drafts are prepared only after the private endeavor and site foundation are linked.
  status("Your conversation is saved privately. Preparing your unpublished website foundation...");
  try{
   let previousSite=null;
   try{previousSite=JSON.parse(sessionStorage.getItem(siteKey)||"null")}catch{sessionStorage.removeItem(siteKey)}
   let linkedId=previousSite?.endeavorId===result.id?previousSite.siteId:undefined;
   if(!linkedId){const saved=await window.SHANEEndeavorStore.load(client,result.id);linkedId=saved.linkedSiteId||undefined}
   const site=await window.SHANEProvision.provision(client,{spec:inferred.spec,vision,siteId:linkedId,editorContent:snap.draftReady?draft:null});
   await window.SHANEEndeavorStore.linkSite(client,result.id,site.siteId);
   rememberRevision(result.id,(await window.SHANEEndeavorStore.load(client,result.id)).revision);
   sessionStorage.setItem(siteKey,JSON.stringify({endeavorId:result.id,siteId:site.siteId}));
   let linkedOrganizationId=null;
   const types=inferred.spec.modules.map(m=>m.type);
   if(types.some(t=>["memberships","discussions"].includes(t))){
    try{
     const organizationKey="shane_org_for_endeavor_v1";
     let savedOrg=null;
     try{savedOrg=JSON.parse(sessionStorage.getItem(organizationKey)||"null")}catch{sessionStorage.removeItem(organizationKey)}
     let organizationId=savedOrg?.endeavorId===result.id?savedOrg.organizationId:undefined;
     if(!organizationId){const saved=await window.SHANEEndeavorStore.load(client,result.id);organizationId=saved.linkedOrganizationId||undefined}
     const organization=await window.SHANEOrganizationProvision.provision(client,{spec:inferred.spec,vision,organizationId});
     await window.SHANEEndeavorStore.linkOrganization(client,result.id,organization.organizationId);
     rememberRevision(result.id,(await window.SHANEEndeavorStore.load(client,result.id)).revision);
     linkedOrganizationId=organization.organizationId;
     sessionStorage.setItem(organizationKey,JSON.stringify({endeavorId:result.id,organizationId:organization.organizationId}));
     status("Your conversation, private website, and community foundation are saved. No invitations or public posts were sent.");
    }catch(orgError){
     status("Your private website is saved, but community setup needs attention: "+orgError.message);
    }
   }else{
    status("Your conversation and private website foundation are saved. Additional services are not yet provisioned; nothing was published.");
   }
   // Notify integrations after website and optional organization linking settle.
   // A failed optional organization setup still preserves the saved endeavor and private network draft.
   document.dispatchEvent(new CustomEvent("shane:endeavor-saved",{detail:{endeavorId:result.id,title,vision,siteId:site.siteId,organizationId:linkedOrganizationId}}));
  }catch(siteError){
   status("Your conversation is saved, but the private website foundation could not be created: "+siteError.message+". SHANE will still prepare your private network draft.");
   // An optional website provisioning failure must not block the independent network draft.
   document.dispatchEvent(new CustomEvent("shane:endeavor-saved",{detail:{endeavorId:result.id,title,vision,siteId:null,organizationId:null}}));
   // The private endeavor DID save. Report success so autosave does not restore
   // an older endeavor identity over the newly persisted conversation.
   return true;
  }
  return true;
 }catch(e){status("Conversation not saved: "+e.message);return false}
 finally{saveInProgress=false;if(button)button.disabled=false}
}
let autosaveBusy=false;
async function autosaveAfterGeneration(mode){
 if(autosaveBusy)return;
 const client=window.SHANEAuthenticatedClient;
 if(!client)return;
 autosaveBusy=true;
 try{
  // A newly generated website must not silently overwrite a previously saved endeavor.
  if(mode==="new"){
   const prior={endeavor:sessionStorage.getItem(key),revision:sessionStorage.getItem(revisionKey),site:sessionStorage.getItem(siteKey),organization:sessionStorage.getItem("shane_org_for_endeavor_v1")};
   sessionStorage.removeItem(key);sessionStorage.removeItem(revisionKey);sessionStorage.removeItem(siteKey);sessionStorage.removeItem("shane_org_for_endeavor_v1");
   const saved=await save();
   if(!saved){
    if(prior.endeavor)sessionStorage.setItem(key,prior.endeavor);
    if(prior.revision)sessionStorage.setItem(revisionKey,prior.revision);
    if(prior.site)sessionStorage.setItem(siteKey,prior.site);
    if(prior.organization)sessionStorage.setItem("shane_org_for_endeavor_v1",prior.organization);
   }
  }else await save();
 }finally{autosaveBusy=false}
}
document.addEventListener("shane:ai-generation-finished",event=>{
 const message=String(event.detail?.status||"");
 if(!/^AI (?:revision ready|content generated)/i.test(message))return;
 // The conversation's completion listener runs after this event. Defer save
 // to the next task so the generated response and draftReady flag are included.
 setTimeout(()=>autosaveAfterGeneration(event.detail?.mode),0);
});
async function resume(requestedId){
 const id=typeof requestedId==="string"?requestedId:sessionStorage.getItem(key);if(!id){status("No saved endeavor is linked to this browser session yet.");return}
 const client=window.SHANEAuthenticatedClient;if(!client){status("The account connection is not ready.");return}
 try{
  const result=await window.SHANEEndeavorStore.load(client,id);
  if(!result.conversation?.length){status("This endeavor has no saved conversation yet.");return}
  const current=snapshot();
  if(current?.turns?.length&&!confirm("Replace this browser session's conversation with your saved conversation? Unsaved editor changes may be lost."))return;
  // Only mark the conversation draft-ready after verifying its linked editor content.
  sessionStorage.setItem(key,id);
  rememberRevision(id,result.revision);
  document.dispatchEvent(new CustomEvent("shane:conversation-restore",{detail:{turns:result.conversation,draftReady:false}}));
  window.SHANECurrentComposition={spec:result.spec,sourceVision:result.vision,provisioningStatus:"not_provisioned"};
  if(result.linkedSiteId){
   try{
    const {data:site,error:siteError}=await client.from("shane_sites").select("id,owner_id,content,status").eq("id",result.linkedSiteId).single();
    const {data:auth,error:authError}=await client.auth.getUser();
    if(siteError||authError||!auth?.user?.id||!site||site.owner_id!==auth.user.id)throw Error("Saved website is not accessible in this account");
    const restoredDraft=site.content?.shaneEditorDraft||((site.content?.business||site.content?.name)&&typeof site.content?.pages==="string"?site.content:null);
    if(restoredDraft){
     document.dispatchEvent(new CustomEvent("shane:editor-restore",{detail:{content:restoredDraft}}));
     document.dispatchEvent(new CustomEvent("shane:conversation-draft-ready",{detail:{draftReady:true}}));
     status("Your conversation and editable website draft are restored. Nothing was published.");
    }else{
     status("Your conversation is restored. This creation has a private site foundation, but no editable website draft yet. Ask SHANE to create the website.");
    }
   }catch(restoreError){status("Conversation restored, but the website draft could not be reopened: "+restoreError.message)}
  }
  if(result.linkedSiteId)sessionStorage.setItem(siteKey,JSON.stringify({endeavorId:result.id,siteId:result.linkedSiteId}));
  else sessionStorage.removeItem(siteKey);
  if(result.linkedOrganizationId)sessionStorage.setItem("shane_org_for_endeavor_v1",JSON.stringify({endeavorId:result.id,organizationId:result.linkedOrganizationId}));
  else sessionStorage.removeItem("shane_org_for_endeavor_v1");
  if(!result.linkedSiteId)status("Your conversation has been restored. No linked website draft was found.");
  document.dispatchEvent(new CustomEvent("shane:endeavor-resumed",{detail:{endeavorId:result.id}}));
 }catch(e){status("Could not resume: "+e.message)}
}
async function analystContext(){
 const client=window.SHANEAuthenticatedClient;
 const id=sessionStorage.getItem(key);
 if(!client||!id){status("Save your endeavor before opening its Analyst context.");return}
 try{
  const context=await window.SHANEEndeavorContext.load(client,id,window.SHANEEndeavorStore,"analyst");
  document.dispatchEvent(new CustomEvent("shane:analyst-context-ready",{detail:context}));
  status("Your saved endeavor is ready for Analyst review. No project changes were made.");
 }catch(error){status("Could not prepare Analyst context: "+error.message)}
}
async function discoverSaved(){
 const client=window.SHANEAuthenticatedClient;if(!client){status("Sign in to find your saved creations.");return}
 const area=get("shaneSavedEndeavors");area.replaceChildren();status("Looking for your private creations...");
 try{
  const items=await window.SHANEEndeavorStore.list(client);
  if(!items.length){status("No saved endeavors found in this account.");return}
  for(const item of items){
   const button=document.createElement("button");button.type="button";
   button.textContent=item.title||"Untitled creation";
   button.addEventListener("click",()=>resume(item.id));
   area.append(button);
  }
  status("Choose a saved creation to resume its conversation. Your current website draft will remain unchanged.");
 }catch(e){status("Could not find creations: "+e.message)}
}
document.addEventListener("DOMContentLoaded",()=>{
 const area=get("shane-idea-conversation");if(!area)return;
 // Dashboard continuation opens the exact saved endeavor, never an unrelated browser-session draft.
 const requestedEndeavor=new URLSearchParams(location.search).get("endeavor");
 if(requestedEndeavor){
  const requested=requestedEndeavor.trim();
  if(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requested)){
   const openRequested=()=>{
    if(!window.SHANEAuthenticatedClient){status("Sign in to resume this endeavor, then use Resume saved conversation.");return}
    resume(requested);
   };
   if(window.SHANEAuthenticatedClient)openRequested();
   else window.addEventListener("shane:client-ready",()=>queueMicrotask(openRequested),{once:true});
  }else status("This endeavor link is invalid. Your existing conversation has not been changed.");
 }

 const actions=document.createElement("div");actions.className="shane-idea-actions";
 const keep=document.createElement("button");keep.type="button";keep.id="shaneKeepConversation";keep.textContent="Keep this conversation";keep.addEventListener("click",save);
 const reopen=document.createElement("button");reopen.type="button";reopen.textContent="Resume saved conversation";reopen.addEventListener("click",()=>resume());
 const discover=document.createElement("button");discover.type="button";discover.textContent="Find my saved creations";discover.addEventListener("click",discoverSaved);
 const choices=document.createElement("div");choices.id="shaneSavedEndeavors";choices.setAttribute("aria-label","Your saved creations");
 const info=document.createElement("p");info.id="shaneContinuityStatus";info.setAttribute("role","status");info.setAttribute("aria-live","polite");info.textContent="Sign in to keep this conversation privately in your SHANE account. Website drafts are saved separately.";
 const analyst=document.createElement("button");analyst.type="button";analyst.textContent="Prepare Analyst review";analyst.addEventListener("click",analystContext);
 const connected=document.createElement("button");connected.type="button";connected.textContent="My connected endeavor";connected.addEventListener("click",openConnectedEndeavor);
 document.addEventListener("shane:endeavor-saved",openConnectedEndeavor);
 document.addEventListener("shane:endeavor-resumed",openConnectedEndeavor);
 document.addEventListener("shane:network-draft-ready",event=>{
  if(event.detail?.endeavorId===sessionStorage.getItem(key))openConnectedEndeavor();
 });
 let connectedViewVersion=0;
 async function openConnectedEndeavor(){
  const version=++connectedViewVersion;
  const id=sessionStorage.getItem(key),client=window.SHANEAuthenticatedClient;
  if(!id||!client){status("Save or reopen an endeavor while signed in to view its connected capabilities.");return}
  try{
   const saved=await window.SHANEEndeavorStore.load(client,id);
   if(version!==connectedViewVersion||id!==sessionStorage.getItem(key))return;
   const manifest=window.SHANECapabilityManifest.describe(saved);
   const details=get("shaneConnectedDetails");details.replaceChildren();
   const title=document.createElement("strong");title.textContent=saved.title||"Your endeavor";details.append(title);
   const explanation=document.createElement("p");explanation.textContent="These links use the same saved endeavor. Unfinished services are not represented as active.";details.append(explanation);
   let listing=null;
   const {data:auth,error:authError}=await client.auth.getUser();
   if(authError||!auth?.user?.id)throw Error("Sign in to inspect connected network listings.");
   const {data:linkedListing,error:listingError}=await client.from("shane_listings").select("id,status,endeavor_id").eq("endeavor_id",saved.id).eq("owner_id",auth.user.id).maybeSingle();
   if(version!==connectedViewVersion||id!==sessionStorage.getItem(key))return;
   if(listingError)throw Error("Could not verify linked network listing: "+listingError.message);
   listing=linkedListing;
   const readiness=window.SHANEEndeavorOrchestrator?.inspect(saved,listing);
   if(readiness){
    const report=document.createElement("p");
    report.textContent="Connected services and their current status:";
    const serviceList=document.createElement("ul");serviceList.className="shane-service-readiness";
    for(const [name,item] of Object.entries(readiness)){
     const line=document.createElement("li");line.textContent=name+": "+item.state;serviceList.append(line);
    }
    details.append(report,serviceList);
   }
   // Bring accepted collaborations for this exact endeavor into the same journey.
   const {data:collaborations,error:collabError}=listing?await client.from("shane_collaboration_requests")
    .select("id,status,sender_id,recipient_id").eq("listing_id",listing.id).in("status",["pending","accepted"]).limit(25):{data:[],error:null};
   if(version!==connectedViewVersion||id!==sessionStorage.getItem(key))return;
   if(collabError){const notice=document.createElement("p");notice.textContent="Collaborations could not be loaded: "+collabError.message;details.append(notice)}
   else if(collaborations?.length){
    const group=document.createElement("section");group.className="shane-endeavor-collaborations";
    const heading=document.createElement("h4");heading.textContent="People connecting around this endeavor";group.append(heading);
    for(const collaboration of collaborations){
     if(collaboration.sender_id!==auth.user.id&&collaboration.recipient_id!==auth.user.id)continue;
     const conversation=document.createElement("a");conversation.href="members.html?endeavor="+encodeURIComponent(saved.id)+"&conversation="+encodeURIComponent(collaboration.id)+"#collaborationSection";
     conversation.textContent=collaboration.status==="accepted"?"Open full collaboration workspace":"Review pending collaboration request";group.append(conversation);
     if(collaboration.status==="pending"&&collaboration.recipient_id===auth.user.id){
      const decision=document.createElement("div");decision.className="shane-creator-invitation-decision";
      const message=document.createElement("p");message.textContent="Someone would like to collaborate. You decide whether to welcome the request.";decision.append(message);
      const feedback=document.createElement("p");feedback.setAttribute("role","status");
      const accept=document.createElement("button");accept.type="button";accept.textContent="Accept invitation";
      const decline=document.createElement("button");decline.type="button";decline.textContent="Decline invitation";
      async function decide(nextStatus){accept.disabled=true;decline.disabled=true;
       const result=await client.from("shane_collaboration_requests").update({status:nextStatus}).eq("id",collaboration.id).eq("recipient_id",auth.user.id).eq("status","pending").select("id").maybeSingle();
       if(version!==connectedViewVersion||id!==sessionStorage.getItem(key)||!decision.isConnected)return;
       if(result.error||!result.data){feedback.textContent=result.error?"Could not update invitation: "+result.error.message:"This invitation was already changed. Refresh your endeavor.";accept.disabled=false;decline.disabled=false;return}
       feedback.textContent=nextStatus==="accepted"?"Invitation accepted. Opening your collaboration…":"Invitation declined.";
       await openConnectedEndeavor();
      }
      accept.addEventListener("click",()=>decide("accepted"));decline.addEventListener("click",()=>decide("declined"));
      decision.append(accept,decline,feedback);group.append(decision);
     }
     if(collaboration.status==="accepted"){
      const openMessages=document.createElement("button");openMessages.type="button";openMessages.textContent="Read and write messages here";
      const thread=document.createElement("section");thread.className="shane-creator-private-thread";thread.hidden=true;
      const history=document.createElement("div");history.setAttribute("aria-live","polite");
      const feedback=document.createElement("p");feedback.setAttribute("role","status");
      const form=document.createElement("form");const field=document.createElement("textarea");field.required=true;field.maxLength=4000;field.rows=3;field.setAttribute("aria-label","Private collaboration message");field.placeholder="Write to your collaborator…";
      const send=document.createElement("button");send.type="submit";send.textContent="Send private message";
      const refresh=document.createElement("button");refresh.type="button";refresh.textContent="Refresh conversation";
      form.append(field,send);thread.append(history,form,refresh,feedback);
      let requestVersion=0;
      async function loadMessages(){const current=++requestVersion;const result=await client.from("shane_collaboration_messages").select("id,sender_id,body,created_at").eq("request_id",collaboration.id).order("created_at",{ascending:false}).limit(100);
       if(current!==requestVersion||version!==connectedViewVersion||id!==sessionStorage.getItem(key)||!thread.isConnected)return;
       if(result.error){feedback.textContent="Messages unavailable: "+result.error.message;return}
       history.replaceChildren();for(const message of [...(result.data||[])].reverse()){const p=document.createElement("p");p.textContent=(message.sender_id===auth.user.id?"You: ":"Collaborator: ")+message.body;history.append(p)}
       if(!result.data?.length)history.textContent="No messages yet. Begin the conversation.";feedback.textContent="Conversation up to date.";
      }
      openMessages.addEventListener("click",()=>{thread.hidden=!thread.hidden;openMessages.textContent=thread.hidden?"Read and write messages here":"Hide private messages";if(!thread.hidden)loadMessages()});
      refresh.addEventListener("click",loadMessages);
      form.addEventListener("submit",async event=>{event.preventDefault();const body=field.value.trim();if(!body||body.length>4000)return;
       send.disabled=true;const result=await client.from("shane_collaboration_messages").insert({request_id:collaboration.id,sender_id:auth.user.id,body});send.disabled=false;
       if(version!==connectedViewVersion||id!==sessionStorage.getItem(key)||!thread.isConnected)return;
       if(result.error){feedback.textContent="Message not sent: "+result.error.message;return}
       field.value="";feedback.textContent="Message sent.";await loadMessages();
      });
      group.append(openMessages,thread);
     }
    }
    details.append(group);
   }
   // Discover public opportunities without leaving the endeavor conversation.
   const discovery=document.createElement("section");discovery.className="shane-creator-discovery";
   const discoveryHeading=document.createElement("h4");discoveryHeading.textContent="Discover people and possibilities from here";
   const discoveryForm=document.createElement("form");discoveryForm.setAttribute("role","search");
   const discoveryInput=document.createElement("input");discoveryInput.type="search";discoveryInput.maxLength=100;discoveryInput.placeholder="People, projects, skills, interests…";discoveryInput.setAttribute("aria-label","Search public network opportunities");
   const discoveryButton=document.createElement("button");discoveryButton.type="submit";discoveryButton.textContent="Explore network";
   const discoveryStatus=document.createElement("p");discoveryStatus.setAttribute("role","status");
   const discoveryResults=document.createElement("div");discoveryResults.className="shane-creator-discovery-results";
   discoveryForm.append(discoveryInput,discoveryButton);discovery.append(discoveryHeading,discoveryForm,discoveryStatus,discoveryResults);details.append(discovery);
   // Interpret the saved endeavor into discovery terms, without requiring a second setup form.
   const visionWords=String(saved.vision||"").toLowerCase().match(/[\\p{L}\\p{N}]{4,}/gu)||[];
   const ignored=new Set(["this","that","with","from","have","will","would","should","could","there","their","about","want","need","make","create","build","help","people","some","into","your","they","them","what","when","where","then","also","like","more","very","just","only","because","which","while","through","network","shane","website"]);
   const frequency=new Map();for(const word of visionWords.slice(0,600)){if(!ignored.has(word))frequency.set(word,(frequency.get(word)||0)+1)}
   const suggestedTerms=[...frequency].sort((a,b)=>b[1]-a[1]).slice(0,3).map(entry=>entry[0]);
   const suggest=document.createElement("button");suggest.type="button";suggest.textContent="Find opportunities for my vision";
   suggest.addEventListener("click",()=>{if(!suggestedTerms.length){discoveryStatus.textContent="Tell SHANE more about your endeavor to discover relevant opportunities.";return}discoveryInput.value=suggestedTerms.join(" ");discoveryForm.requestSubmit()});
   discovery.append(suggest);
   let discoveryVersion=0;
   discoveryForm.addEventListener("submit",async event=>{
    event.preventDefault();const query=discoveryInput.value.trim();const request=++discoveryVersion;
    if(!query){discoveryStatus.textContent="Describe what you would like to discover.";return}
    const terms=[...new Set(query.toLowerCase().replace(/[^\\p{L}\\p{N}\\s-]/gu," ").split(/\\s+/).filter(word=>word.length>=2&&word.length<=40))].slice(0,5);
    if(!terms.length){discoveryStatus.textContent="Try a word or phrase about what you are looking for.";return}
    discoveryButton.disabled=true;discoveryStatus.textContent="Finding public opportunities…";
    try{
     let requestQuery=client.from("shane_listings").select("id,owner_id,title,category,description,region").eq("status","published").neq("owner_id",auth.user.id);
     requestQuery=requestQuery.or(terms.flatMap(term=>["title","description","region","category"].map(column=>column+".ilike.%"+term.replace(/[%_,.()\\]/g,"")+"%")).join(","));
     const result=await requestQuery.order("created_at",{ascending:false}).limit(100);
     if(request!==discoveryVersion||version!==connectedViewVersion||id!==sessionStorage.getItem(key)||!discovery.isConnected)return;
     if(result.error)throw result.error;
     const ranked=(result.data||[]).map(opportunity=>{const title=String(opportunity.title||"").toLowerCase();const description=String(opportunity.description||"").toLowerCase();const context=[opportunity.category,opportunity.region].filter(Boolean).join(" ").toLowerCase();const score=terms.reduce((total,term)=>total+(title.includes(term)?5:0)+(description.includes(term)?2:0)+(context.includes(term)?1:0),0);return {opportunity,score}}).sort((a,b)=>b.score-a.score).slice(0,12);
     discoveryResults.replaceChildren();discoveryStatus.textContent=ranked.length+" relevant public opportunities shown.";
     for(const {opportunity} of ranked){
      const card=document.createElement("article");const name=document.createElement("strong");name.textContent=opportunity.title||"Untitled endeavor";
      const description=document.createElement("p");description.textContent=String(opportunity.description||"").slice(0,350);
      const view=document.createElement("a");view.href="network.html?endeavor="+encodeURIComponent(saved.id)+"&listing="+encodeURIComponent(opportunity.id);view.textContent="Explore and introduce yourself";
      const invite=document.createElement("button");invite.type="button";invite.textContent="Introduce myself privately";
      const invitationFeedback=document.createElement("p");invitationFeedback.setAttribute("role","status");
      invite.addEventListener("click",async()=>{
       if(version!==connectedViewVersion||id!==sessionStorage.getItem(key))return;
       invite.disabled=true;
       const previous=await client.from("shane_collaboration_requests").select("id,status").eq("listing_id",opportunity.id).eq("sender_id",auth.user.id).eq("recipient_id",opportunity.owner_id).in("status",["pending","accepted"]).limit(1);
       if(version!==connectedViewVersion||id!==sessionStorage.getItem(key)||!card.isConnected)return;
       if(previous.error){invitationFeedback.textContent="Unable to check existing introductions: "+previous.error.message;invite.disabled=false;return}
       if(previous.data?.length){const existing=previous.data[0];invitationFeedback.textContent=existing.status==="accepted"?"You already collaborate on this endeavor.":"Your invitation is awaiting a response.";
        const conversation=document.createElement("a");conversation.href="members.html?endeavor="+encodeURIComponent(saved.id)+"&conversation="+encodeURIComponent(existing.id)+"#collaborationSection";conversation.textContent="Open private collaboration";card.append(conversation);return}
       const form=document.createElement("form");const message=document.createElement("textarea");message.required=true;message.minLength=10;message.maxLength=2000;message.rows=3;message.setAttribute("aria-label","Private introduction");message.placeholder="What interests you about this endeavor?";
       const send=document.createElement("button");send.type="submit";send.textContent="Send private introduction";const cancel=document.createElement("button");cancel.type="button";cancel.textContent="Cancel";cancel.addEventListener("click",()=>{form.remove();invite.disabled=false});
       form.append(message,send,cancel);card.append(form);message.focus();
       form.addEventListener("submit",async event=>{event.preventDefault();const body=message.value.trim();if(body.length<10||body.length>2000)return;send.disabled=true;
        const duplicate=await client.from("shane_collaboration_requests").select("id").eq("listing_id",opportunity.id).eq("sender_id",auth.user.id).eq("recipient_id",opportunity.owner_id).in("status",["pending","accepted"]).limit(1);
        if(version!==connectedViewVersion||id!==sessionStorage.getItem(key)||!card.isConnected)return;
        if(duplicate.error||duplicate.data?.length){invitationFeedback.textContent=duplicate.error?"Could not verify invitation: "+duplicate.error.message:"An active invitation already exists.";send.disabled=false;return}
        const result=await client.from("shane_collaboration_requests").insert({listing_id:opportunity.id,sender_id:auth.user.id,recipient_id:opportunity.owner_id,message:body}).select("id").single();
        if(version!==connectedViewVersion||id!==sessionStorage.getItem(key)||!card.isConnected)return;
        if(result.error){invitationFeedback.textContent="Invitation not sent: "+result.error.message;send.disabled=false;return}
        form.remove();invitationFeedback.textContent="Private invitation sent. The recipient can choose whether to accept.";
        const conversation=document.createElement("a");conversation.href="members.html?endeavor="+encodeURIComponent(saved.id)+"&conversation="+encodeURIComponent(result.data.id)+"#collaborationSection";conversation.textContent="Follow this invitation";card.append(conversation);
       });
      });
      card.append(name,description,view,invite,invitationFeedback);discoveryResults.append(card);
     }
    }catch(error){if(request===discoveryVersion&&version===connectedViewVersion&&id===sessionStorage.getItem(key))discoveryStatus.textContent="Discovery unavailable: "+error.message}
    finally{if(request===discoveryVersion)discoveryButton.disabled=false}
   });
   // Discover automatically from the saved vision, without publishing or contacting anyone.
   if(suggestedTerms.length){discoveryInput.value=suggestedTerms.join(" ");discoveryForm.requestSubmit()}
   const links=[["Continue our conversation","builder.html?endeavor="+encodeURIComponent(saved.id)+"#vision-first"],["Discover people and opportunities","network.html?endeavor="+encodeURIComponent(saved.id)],["Review network presence","my-network.html"],["Manage network listing",listing?"members.html?listing="+encodeURIComponent(listing.id)+"#mineSection":"members.html#mineSection"],["Collaborations and private messages","members.html?endeavor="+encodeURIComponent(saved.id)+"#collaborationSection"],["Request Analyst review",null]];
   if(manifest.resources.organization)links.push(["Manage linked club or society","communities.html?organization="+encodeURIComponent(manifest.resources.organization)]);
   for(const [label,href] of links){const control=document.createElement(href?"a":"button");control.textContent=label;if(href)control.href=href;else{control.type="button";control.addEventListener("click",analystContext)}details.append(control,document.createTextNode(" · "))}
   const journey=document.createElement("p");journey.className="shane-endeavor-journey";journey.textContent="Your conversation is the center. Keep developing your idea, discover collaborators, and manage its network presence without starting over.";details.insertBefore(journey,details.children[2]||null);
   const note=document.createElement("p");note.textContent="Linked website: "+(manifest.resources.site?"private foundation saved":"not linked")+"; network listing: "+(listing?(listing.status==="published"?"published":listing.status==="draft"?"private draft":"unverified status"):"not yet linked")+"; linked community: "+(manifest.resources.organization?"private foundation saved":"not linked")+". Billing, AI Professionals, video and games require separate verified activation.";details.append(note);
   status("Connected endeavor loaded from your account.");
  }catch(error){if(version===connectedViewVersion)status("Could not open connected endeavor: "+error.message)}
 }
 const details=document.createElement("div");details.id="shaneConnectedDetails";details.setAttribute("aria-live","polite");

 actions.append(keep,reopen,discover,analyst,connected);area.append(actions,choices,details,info);
});
})();
