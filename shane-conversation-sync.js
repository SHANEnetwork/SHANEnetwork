/* Non-destructive save and resume for SHANE's conversational vision.
   Explicit save; owner-scoped Supabase RLS; never publishes a site. */
(function(){
"use strict";
const key="shane_last_private_endeavor_v1",siteKey="shane_private_site_for_endeavor_v1";
function get(id){return document.getElementById(id)}
function snapshot(){let result=null;const listener=e=>{result=e.detail};document.addEventListener("shane:conversation-snapshot",listener,{once:true});document.dispatchEvent(new Event("shane:conversation-export"));document.removeEventListener("shane:conversation-snapshot",listener);return result}
function status(text){const el=get("shaneContinuityStatus");if(el)el.textContent=text}
async function save(){
 const client=window.SHANEAuthenticatedClient;
 if(!client){status("The account connection is not ready. Try again shortly.");return}
 const snap=snapshot();if(!snap){status("The conversation is not ready.");return}
 const vision=snap.turns.filter(t=>t.role==="you").map(t=>t.text).join("\n");
 if(!vision.trim()){status("Describe your idea to SHANE before saving the conversation.");return}
 const current=window.SHANECurrentComposition;
 const inferred=current||window.SHANEVision.interpret(vision);
 const title=(get("siteName")?.value||get("name")?.value||inferred.spec.title||"My Endeavor").trim();
 const existing=sessionStorage.getItem(key);
 const button=get("shaneKeepConversation");button.disabled=true;
 try{
  const result=await window.SHANEEndeavorStore.save(client,{title,vision,spec:inferred.spec,conversation:snap.turns,endeavorId:existing||undefined});
  sessionStorage.setItem(key,result.id);
  status("Your conversation is saved privately. Preparing your unpublished website foundation...");
  try{
   const previousSite=JSON.parse(sessionStorage.getItem(siteKey)||"null");
   const site=await window.SHANEProvision.provision(client,{spec:inferred.spec,vision,siteId:previousSite?.endeavorId===result.id?previousSite.siteId:undefined});
   await window.SHANEEndeavorStore.linkSite(client,result.id,site.siteId);
   sessionStorage.setItem(siteKey,JSON.stringify({endeavorId:result.id,siteId:site.siteId}));
   status("Your conversation and private website foundation are saved. Additional services are not yet provisioned; nothing was published.");
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
  document.dispatchEvent(new CustomEvent("shane:conversation-restore",{detail:{turns:result.conversation,draftReady:false}}));
  window.SHANECurrentComposition={spec:result.spec,sourceVision:result.vision,provisioningStatus:"not_provisioned"};
  if(result.linkedSiteId)sessionStorage.setItem(siteKey,JSON.stringify({endeavorId:result.id,siteId:result.linkedSiteId}));
  status("Your private conversation has been restored. The website draft remains separate.");
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
