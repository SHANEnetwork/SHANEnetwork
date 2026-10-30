/* Non-destructive save and resume for SHANE's conversational vision.
   Private autosave; owner-scoped Supabase RLS; never publishes a site. */
(function(){
"use strict";
const key="shane_last_private_endeavor_v1",siteKey="shane_private_site_for_endeavor_v1";
function get(id){return document.getElementById(id)}
function snapshot(){let result=null;const listener=e=>{result=e.detail};document.addEventListener("shane:conversation-snapshot",listener,{once:true});document.dispatchEvent(new Event("shane:conversation-export"));document.removeEventListener("shane:conversation-snapshot",listener);return result}
function editorSnapshot(){let result=null;const listener=e=>{result=e.detail?.content||null};document.addEventListener("shane:editor-snapshot",listener,{once:true});document.dispatchEvent(new Event("shane:editor-export"));document.removeEventListener("shane:editor-snapshot",listener);return result}
function status(text){const el=get("shaneContinuityStatus");if(el)el.textContent=text}
async function save(){
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
 let savedState=null;
 try{if(existing)savedState=await window.SHANEEndeavorStore.load(client,existing)}catch(e){status("Unable to verify your previous creation: "+e.message);return false}
 if(existing&&!savedState){status("This saved creation is unavailable in the signed-in account. Your conversation was not overwritten.");return false}
 if(savedState?.spec?.shaneOrganizationId)inferred.spec.shaneOrganizationId=savedState.spec.shaneOrganizationId;
 const button=get("shaneKeepConversation");if(button)button.disabled=true;
 try{
  const result=await window.SHANEEndeavorStore.save(client,{title,vision,spec:inferred.spec,conversation:snap.turns,endeavorId:existing||undefined});
  sessionStorage.setItem(key,result.id);
  // Network drafts are prepared only after the private endeavor and site foundation are linked.
  status("Your conversation is saved privately. Preparing your unpublished website foundation...");
  try{
   let previousSite=null;
   try{previousSite=JSON.parse(sessionStorage.getItem(siteKey)||"null")}catch{sessionStorage.removeItem(siteKey)}
   let linkedId=previousSite?.endeavorId===result.id?previousSite.siteId:undefined;
   if(!linkedId){const saved=await window.SHANEEndeavorStore.load(client,result.id);linkedId=saved.linkedSiteId||undefined}
   const site=await window.SHANEProvision.provision(client,{spec:inferred.spec,vision,siteId:linkedId,editorContent:snap.draftReady?draft:null});
   await window.SHANEEndeavorStore.linkSite(client,result.id,site.siteId);
   sessionStorage.setItem(siteKey,JSON.stringify({endeavorId:result.id,siteId:site.siteId}));
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
   document.dispatchEvent(new CustomEvent("shane:endeavor-saved",{detail:{endeavorId:result.id,title,vision,siteId:site.siteId}}));
  }catch(siteError){
   status("Your conversation is saved, but the private website foundation could not be created: "+siteError.message);
   return false;
  }
  return true;
 }catch(e){status("Conversation not saved: "+e.message);return false}
 finally{if(button)button.disabled=false}
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
   const prior={endeavor:sessionStorage.getItem(key),site:sessionStorage.getItem(siteKey),organization:sessionStorage.getItem("shane_org_for_endeavor_v1")};
   sessionStorage.removeItem(key);sessionStorage.removeItem(siteKey);sessionStorage.removeItem("shane_org_for_endeavor_v1");
   const saved=await save();
   if(!saved){
    if(prior.endeavor)sessionStorage.setItem(key,prior.endeavor);
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
async function resume(){
 const id=sessionStorage.getItem(key);if(!id){status("No saved endeavor is linked to this browser session yet.");return}
 const client=window.SHANEAuthenticatedClient;if(!client){status("The account connection is not ready.");return}
 try{
  const result=await window.SHANEEndeavorStore.load(client,id);
  if(!result.conversation?.length){status("This endeavor has no saved conversation yet.");return}
  const current=snapshot();
  if(current?.turns?.length&&!confirm("Replace this browser session's conversation with your saved conversation? Unsaved editor changes may be lost."))return;
  // Only mark the conversation draft-ready after verifying its linked editor content.
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
   button.addEventListener("click",()=>{sessionStorage.setItem(key,item.id);resume()});
   area.append(button);
  }
  status("Choose a saved creation to resume its conversation. Your current website draft will remain unchanged.");
 }catch(e){status("Could not find creations: "+e.message)}
}
document.addEventListener("DOMContentLoaded",()=>{
 const area=get("shane-idea-conversation");if(!area)return;
 const actions=document.createElement("div");actions.className="shane-idea-actions";
 const keep=document.createElement("button");keep.type="button";keep.id="shaneKeepConversation";keep.textContent="Keep this conversation";keep.addEventListener("click",save);
 const reopen=document.createElement("button");reopen.type="button";reopen.textContent="Resume saved conversation";reopen.addEventListener("click",resume);
 const discover=document.createElement("button");discover.type="button";discover.textContent="Find my saved creations";discover.addEventListener("click",discoverSaved);
 const choices=document.createElement("div");choices.id="shaneSavedEndeavors";choices.setAttribute("aria-label","Your saved creations");
 const info=document.createElement("p");info.id="shaneContinuityStatus";info.setAttribute("role","status");info.setAttribute("aria-live","polite");info.textContent="Sign in to keep this conversation privately in your SHANE account. Website drafts are saved separately.";
 const analyst=document.createElement("button");analyst.type="button";analyst.textContent="Prepare Analyst review";analyst.addEventListener("click",analystContext);
 actions.append(keep,reopen,discover,analyst);area.append(actions,choices,info);
});
})();
