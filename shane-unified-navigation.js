/* Shared SHANE wayfinding. Existing application content and navigation remain intact. */
(()=>{"use strict";function init(){
 const header=document.querySelector("body > header, header");if(document.querySelector(".shane-unified-nav"))return;
 const nav=document.createElement("nav");nav.className="shane-unified-nav";nav.setAttribute("aria-label","SHANE shared navigation");
 const items=[["Imagine","index.html#create"],["Create together","builder.html#shane-idea-conversation"],["My endeavors","dashboard.html"],["Conversation history","conversation-history.html"],["Discover","network.html"],["People & messages","members.html"],["Communities","communities.html"],["Collaborate","my-network.html"],["Campaigns","campaigns.html"],["Shared workspace","workspace.html"],["Growth","growth.html"],["Sports networks","sports-district.html"],["Custom builds","request-build.html"]];
 const page=location.pathname.split("/").pop()||"index.html";
 for(const [label,url] of items){const a=document.createElement("a");a.href=url;a.textContent=label;if(url.split("#")[0]===page)a.setAttribute("aria-current","page");nav.append(a)}
 const JOURNAL="shane-shared-conversation-v1";
 const journalRead=()=>{try{const x=JSON.parse(sessionStorage.getItem(JOURNAL)||"null");return x&&Array.isArray(x.turns)?x:{turns:[],updated:0}}catch{return {turns:[],updated:0}}};
 const journalAdd=(value,kind="idea")=>{const text=String(value||"").trim().slice(0,4000);if(!text)return;try{const j=journalRead(),endeavorId=window.SHANECurrentEndeavor?.read?.()||null,last=j.turns[j.turns.length-1];if(last&&last.text===text&&last.page===page&&last.endeavorId===endeavorId)return;j.turns.push({text,page,kind,endeavorId,at:Date.now()});j.turns=j.turns.slice(-30);j.updated=Date.now();sessionStorage.setItem(JOURNAL,JSON.stringify(j));document.dispatchEvent(new CustomEvent("shane:conversation-updated",{detail:{page,kind,text,endeavorId}}))}catch{}};
 const journalContext=()=>{const j=journalRead(),id=window.SHANECurrentEndeavor?.read?.()||null;return {page,turns:j.turns.filter(turn=>(turn.endeavorId||null)===id).slice(-12),updated:j.updated}};
 const journalForEndeavor=id=>journalRead().turns.filter(turn=>(turn.endeavorId||null)===(id||null)).slice(-30);
 const journalTimeline=()=>journalContext().turns.filter(turn=>turn.kind!=="endeavor-transition").map(turn=>({role:"user",content:turn.text,page:turn.page,at:turn.at}));
 const draftFields=["welcomeIdea","visionPrompt","shaneDiscoveryWish","visionInput","communityIdea","campaignIdea","listingIdea","taskIdea","shaneGrowthGoal","shaneBuildRequestGoal","shaneSportsGoal","goalInput","shaneWorkspaceIdea","shaneCommunityVision","shaneMemberWelcome","shane-natural-prompt","sharedPurpose"];
 const draftKey=id=>{let endeavor="personal";try{const selected=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;if(typeof selected==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(selected))endeavor=selected}catch{}return "shane-conversation-draft:"+page+":"+endeavor+":"+id};
 const restoreDrafts=()=>{for(const id of draftFields){const field=document.getElementById(id);if(!field||typeof field.value!=="string")continue;try{const item=JSON.parse(sessionStorage.getItem(draftKey(id))||"null");if(!field.value.trim()&&item&&typeof item.text==="string"&&Date.now()-item.at<604800000){field.value=item.text.slice(0,field.maxLength>0?field.maxLength:10000);field.dispatchEvent(new Event("input",{bubbles:true}))}}catch{}field.addEventListener("input",()=>{try{const value=field.value.trim();if(value)sessionStorage.setItem(draftKey(id),JSON.stringify({text:value.slice(0,10000),at:Date.now()}));else sessionStorage.removeItem(draftKey(id))}catch{}})}};
 restoreDrafts();
 const recentSubstantive=()=>journalContext().turns.slice().reverse().find(turn=>turn&&typeof turn.text==="string"&&turn.text.trim()&&turn.kind!=="endeavor-transition")||null;
 const draftSnapshot=()=>draftFields.map(id=>{const field=document.getElementById(id);return field&&typeof field.value==="string"&&field.value.trim()?{field:id,text:field.value.trim().slice(0,10000)}:null}).filter(Boolean);
 const currentVision=()=>draftSnapshot()[0]?.text||recentSubstantive()?.text||"";
 const clearDraft=(fieldId)=>{if(!draftFields.includes(fieldId))return false;try{sessionStorage.removeItem(draftKey(fieldId));return true}catch{return false}};
 const currentEndeavorId=()=>window.SHANECurrentEndeavor?.read?.()||null;
 const fullContext=async()=>{const id=currentEndeavorId();return {session:journalContext(),saved:id&&window.SHANEConversationStore?await window.SHANEConversationStore.context({endeavorId:id,limit:40}):[],endeavor:id}};
 const conversationSnapshot=async()=>{const context=await fullContext();const saved=context.saved.map(entry=>({text:entry.body,page:entry.source_page,kind:entry.entry_kind,at:entry.created_at}));const session=context.session.turns.filter(turn=>!saved.some(entry=>entry.text===turn.text&&entry.page===turn.page));return {endeavorId:context.endeavor,turns:[...saved,...session]}};
 const endeavorSnapshot=async()=>{const context=await conversationSnapshot();return {...context,active:context.endeavorId?await window.SHANECurrentEndeavor.context():[]}};
 Object.defineProperty(window,"SHANEConversation",{configurable:false,value:Object.freeze({read:journalContext,forEndeavor:journalForEndeavor,timeline:journalTimeline,remember:journalAdd,fullContext,snapshot:conversationSnapshot,endeavorSnapshot,draftSnapshot,currentVision,clearDraft,last:recentSubstantive})});
 import("./shane-conversation-store.js").catch(error=>document.dispatchEvent(new CustomEvent("shane:conversation-save-error",{detail:{message:String(error?.message||error)}})));
 const continuityKey="shane-conversation-continuity-v1";
 const conversationSelectors=["#welcomeIdea","#visionPrompt","#shane-natural-prompt","#shaneDiscoveryWish","#shaneGrowthGoal","#shaneBuildRequestGoal","#shaneWorkspaceIdea","#shaneCommunityVision","#shaneMemberWelcome","#visionInput","#shaneIdeaReply","#communityIdea","#campaignIdea","#listingIdea","#shaneSportsGoal","#taskIdea","#goalInput"];
 const getCurrent=()=>conversationSelectors.map(selector=>document.querySelector(selector)).find(element=>element&&typeof element.value==="string"&&element.value.trim());
 const active=()=>{try{const item=JSON.parse(sessionStorage.getItem(continuityKey)||"null");return item&&typeof item.text==="string"&&Date.now()-item.updated<86400000?item:null}catch{return null}};
 const preserve=()=>{const field=getCurrent();if(!field)return;journalAdd(field.value,"idea");try{sessionStorage.setItem(continuityKey,JSON.stringify({text:field.value.trim().slice(0,4000),source:page,updated:Date.now()}))}catch{}};
 // A single handoff writer lives in shane-endeavor-actions.js. The navigation
 // layer records the idea without overwriting the selected endeavor or routing
 // a conversation into an unrelated form.
 nav.addEventListener("click",event=>{
  const link=event.target.closest("a");
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  preserve();
 });
 const resumeFromAccount=async()=>{
  try{
   const store=window.SHANEConversationStore;
   if(!store)return;
   const selected=window.SHANECurrentEndeavor?.read?.()||null;
   if(!selected)return;
   const entries=await store.recent(30,selected);
   const latest=entries.find(entry=>entry&&entry.text&&entry.kind!=="endeavor-transition")||entries[0];
   if(!latest||active())return;
   sessionStorage.setItem(continuityKey,JSON.stringify({text:latest.text,source:latest.page,updated:Date.now()}));
  }catch{}
 };
 document.addEventListener("shane:conversation-store-ready",()=>void resumeFromAccount());
 for(const selector of conversationSelectors){
  const field=document.querySelector(selector);
  if(!field)continue;
  field.addEventListener("change",()=>{if(field.value?.trim())journalAdd(field.value,"idea")});
 }
 document.addEventListener("submit",event=>{
  const form=event.target;
  if(!(form instanceof HTMLFormElement))return;
  const field=conversationSelectors.map(selector=>form.querySelector(selector)).find(element=>element&&typeof element.value==="string"&&element.value.trim());
  if(field)journalAdd(field.value,"submitted-idea");
 },true);
 window.SHANECurrentEndeavor=Object.freeze({
  read:()=>{try{const id=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id;return typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)?id:null}catch{return null}},
  context:async()=>{const id=window.SHANECurrentEndeavor.read();if(!id||!window.SHANEConversationStore)return [];return window.SHANEConversationStore.endeavorContext(id)},
  continueIn:(destination,text)=>{const id=window.SHANECurrentEndeavor.read();const idea=String(text||recentSubstantive()?.text||"").trim();if(!idea)return false;sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:idea,endeavorId:id,created:Date.now()}));return true}
 });
 document.addEventListener("shane:conversation-store-ready",async()=>{try{const entries=await window.SHANECurrentEndeavor.context();document.dispatchEvent(new CustomEvent("shane:endeavor-context-ready",{detail:{entries}}))}catch{}});
 // One receiver owns incoming vision text. shane-vision-arrival.js preserves existing
 // edits, restores the endeavor identity and announces arrival for page workflows.
 // Do not consume its handoff here by filling a different, possibly private form.
 document.addEventListener("shane:conversation-saved",()=>document.dispatchEvent(new Event("shane:conversation-context-changed")));
 const remembered=active();
 if(remembered&&remembered.source!==page){const hint=document.createElement("p");hint.className="shane-conversation-resume";hint.setAttribute("role","status");hint.style.cssText="margin:8px 0;font:500 13px system-ui;color:inherit";
 const link=document.createElement("a");link.href="builder.html#shane-idea-conversation";link.textContent="Continue our earlier idea in the creator";
 link.addEventListener("click",()=>{try{sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:remembered.text,created:Date.now()}))}catch{}});
 hint.append("Your conversation can continue across SHANE. ",link);nav.append(hint)}
 if(header){header.append(nav)}else{const landmark=document.createElement("div");landmark.className="shane-unified-topbar";landmark.append(nav);document.body.insertBefore(landmark,document.body.firstChild)}
 const accountResume=document.createElement("script");accountResume.src="shane-account-resume-nav.js";accountResume.defer=true;document.head.append(accountResume);
 const endeavorActions=document.createElement("script");endeavorActions.src="shane-endeavor-actions.js";endeavorActions.defer=true;document.head.append(endeavorActions);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();