/* Non-destructive save and resume for SHANE's conversational vision.
   Explicit save; owner-scoped Supabase RLS; never publishes a site. */
(function(){
"use strict";
const key="shane_last_private_endeavor_v1",siteKey="shane_private_site_for_endeavor_v1";
function get(id){return document.getElementById(id)}
function snapshot(){let result=null;const listener=e=>{result=e.detail};document.addEventListener("shane:conversation-snapshot",listener,{once:true});document.dispatchEvent(new Event("shane:conversation-export"));document.removeEventListener("shane:conversation-snapshot",listener);return result}
function editorSnapshot(){let result=null;const listener=e=>{result=e.detail?.content||null};document.addEventListener("shane:editor-snapshot",listener,{once:true});document.dispatchEvent(new Event("shane:editor-export"));document.removeEventListener("shane:editor-snapshot",listener);return result}
function status(text){const el=get("shaneContinuityStatus");if(el)el.textContent=text}
async function save(){
 const client=window.SHANEAuthenticatedClient;
 if(!client){status("The account connection is not ready. Try again shortly.");return}
 const snap=snapshot();if(!snap){status("The conversation is not ready.");return}
 const vision=snap.turns.filter(t=>t.role==="you").map(t=>t.text).join("\n");
 if(!vision.trim()){status("Describe your idea to SHANE before saving the conversation.");return}
 const current=window.SHANECurrentComposition;
 const inferred=window.SHANEVision.interpret(vision);
 const previousSpec=window.SHANECurrentComposition?.spec;
 if(previousSpec?.title&&inferred.spec.title==="My Endeavor")inferred.spec.title=previousSpec.title;
 const title=(get("siteName")?.value||get("name")?.value||inferred.spec.title||"My Endeavor").trim();
 const existing=sessionStorage.getItem(key);
 const savedState=existing?await window.SHANEEndeavorStore.load(client,existing).catch(()=>null):null;
 if(existing&&!savedState){status("This saved creation is unavailable in the signed-in account. Your conversation was not overwritten.");return}
 if(savedState?.spec?.shaneOrganizationId)inferred.spec.shaneOrganizationId=savedState.spec.shaneOrganizationId;
 const button=get("shaneKeepConversation");button.disabled=true;
 try{
  const result=await window.SHANEEndeavorStore.save(client,{title,vision,spec:inferred.spec,conversation:snap.turns,endeavorId:existing||undefined});
  sessionStorage.setItem(key,result.id);
  status("Your conversation is saved privately. Preparing your unpublished website foundation...");
  try{
   const previousSite=JSON.parse(sessionStorage.getItem(siteKey)||"null");
   let linkedId=previousSite?.endeavorId===result.id?previousSite.siteId:undefined;
   if(!linkedId){const saved=await window.SHANEEndeavorStore.load(client,result.id);linkedId=saved.linkedSiteId||undefined}
   const site=await window.SHANEProvision.provision(client,{spec:inferred.spec,vision,siteId:linkedId,editorContent:snap.draftReady?editorSnapshot():null});
   await window.SHANEEndeavorStore.linkSite(client,result.id,site.siteId);
   sessionStorage.setItem(siteKey,JSON.stringify({endeavorId:result.id,siteId:site.siteId}));
   const types=inferred.spec.modules.map(m=>m.type);
   if(types.some(t=>["memberships","discussions"].includes(t))){
    try{
     const organizationKey="shane_org_for_endeavor_v1";
     const savedOrg=JSON.parse(sessionStorage.getItem(organizationKey)||"null");
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
  }catch(siteError){
   status("Your conversation is saved, but the private website foundation could not be created: "+siteError.message);
  }
 }catch(e){status("Conversation not saved: "+e.message)}
 finally{button.disabled=false}
}
async function resume(){
 const id=sessionStorage.getItem(key);if(!id){status("No saved endeavor is linked to this browser session yet.");return}
 const client=window.SHANEAuthenticatedClient;if(!client){status("The account connection is not ready.");return}
 try{
  const result=await window.SHANEEndeavorStore.load(client,id);
  if(!result.conversation?.length){status("This endeavor has no saved conversation yet.");return}
  const current=snapshot();
  if(current?.turns?.length&&!confirm("Replace this browser session's conversation with your saved conversation? Your website draft will not be changed."))return;
  document.dispatchEvent(new CustomEvent("shane:conversation-restore",{detail:{turns:result.conversation,draftReady:!!result.linkedSiteId}}));
  window.SHANECurrentComposition={spec:result.spec,sourceVision:result.vision,provisioningStatus:"not_provisioned"};
  if(result.linkedSiteId){
   try{
    const {data:site,error:siteError}=await client.from("shane_sites").select("id,owner_id,content,status").eq("id",result.linkedSiteId).single();
    const {data:auth,error:authError}=await client.auth.getUser();
    if(siteError||authError||!auth?.user?.id||!site||site.owner_id!==auth.user.id)throw Error("Saved website is not accessible in this account");
    if(site.content?.shaneEditorDraft){
     document.dispatchEvent(new CustomEvent("shane:editor-restore",{detail:{content:site.content.shaneEditorDraft}}));
     status("Your conversation and editable website draft are restored. Nothing was published.");
    }
   }catch(restoreError){status("Conversation restored, but the website draft could not be reopened: "+restoreError.message)}
  }
  if(result.linkedSiteId)sessionStorage.setItem(siteKey,JSON.stringify({endeavorId:result.id,siteId:result.linkedSiteId}));
  if(result.linkedOrganizationId)sessionStorage.setItem("shane_org_for_endeavor_v1",JSON.stringify({endeavorId:result.id,organizationId:result.linkedOrganizationId}));
  if(!result.linkedSiteId)status("Your conversation has been restored. No linked website draft was found.");
 }catch(e){status("Could not resume: "+e.message)}
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
 actions.append(keep,reopen,discover);area.append(actions,choices,info);
});
})();
