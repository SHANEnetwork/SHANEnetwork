/* Shared SHANE wayfinding. Existing application content and navigation remain intact. */
(()=>{"use strict";function init(){
 const header=document.querySelector("body > header, header");if(document.querySelector(".shane-unified-nav"))return;
 const nav=document.createElement("nav");nav.className="shane-unified-nav";nav.setAttribute("aria-label","SHANE shared navigation");
 const items=[["Imagine","index.html#create"],["Create together","builder.html#shane-idea-conversation"],["My endeavors","dashboard.html"],["Conversation history","conversation-history.html"],["Discover","network.html"],["People & messages","members.html"],["Communities","communities.html"],["Collaborate","my-network.html"],["Campaigns","campaigns.html"]];
 const page=location.pathname.split("/").pop()||"index.html";
 for(const [label,url] of items){const a=document.createElement("a");a.href=url;a.textContent=label;if(url.split("#")[0]===page)a.setAttribute("aria-current","page");nav.append(a)}
 const JOURNAL="shane-shared-conversation-v1";
 const journalRead=()=>{try{const x=JSON.parse(sessionStorage.getItem(JOURNAL)||"null");return x&&Array.isArray(x.turns)?x:{turns:[],updated:0}}catch{return {turns:[],updated:0}}};
 const journalAdd=(value,kind="idea")=>{const text=String(value||"").trim().slice(0,4000);if(!text)return;try{const j=journalRead(),last=j.turns[j.turns.length-1];if(last&&last.text===text&&last.page===page)return;j.turns.push({text,page,kind,at:Date.now()});j.turns=j.turns.slice(-30);j.updated=Date.now();sessionStorage.setItem(JOURNAL,JSON.stringify(j));document.dispatchEvent(new CustomEvent("shane:conversation-updated",{detail:{page,kind,text}}))}catch{}};
 const journalContext=()=>{const j=journalRead();return {page,turns:j.turns.slice(-12),updated:j.updated}};
 const fullContext=async()=>{const id=window.SHANECurrentEndeavor?.read()||null;return {session:journalContext(),saved:window.SHANEConversationStore?await window.SHANEConversationStore.context({endeavorId:id,limit:40}):[],endeavor:id}};
 const conversationSnapshot=async()=>{const context=await fullContext();return {endeavorId:context.endeavor,turns:[...context.saved.map(entry=>({text:entry.body,page:entry.source_page,kind:entry.entry_kind,at:entry.created_at})),...context.session.turns]}};
 const endeavorSnapshot=async()=>{const context=await conversationSnapshot();return {...context,active:context.endeavorId?await window.SHANECurrentEndeavor.context():[]}};
 Object.defineProperty(window,"SHANEConversation",{configurable:false,value:Object.freeze({read:journalContext,remember:journalAdd,fullContext,snapshot:conversationSnapshot,endeavorSnapshot,last:()=>journalRead().turns.slice(-1)[0]||null})});
 import("./shane-conversation-store.js").catch(error=>document.dispatchEvent(new CustomEvent("shane:conversation-save-error",{detail:{message:String(error?.message||error)}})));
 const continuityKey="shane-conversation-continuity-v1";
 const conversationSelectors=["#visionPrompt","#shane-natural-prompt","#shaneDiscoveryWish","#shaneGrowthGoal","#shaneBuildRequestGoal","#shaneWorkspaceIdea","#shaneCommunityVision","#shaneMemberWelcome","#visionInput","#sharedPurpose","#sharedNext","#body","#description","#query","#shaneIdeaReply"];
 const getCurrent=()=>conversationSelectors.map(selector=>document.querySelector(selector)).find(element=>element&&typeof element.value==="string"&&element.value.trim());
 const active=()=>{try{const item=JSON.parse(sessionStorage.getItem(continuityKey)||"null");return item&&typeof item.text==="string"&&Date.now()-item.updated<86400000?item:null}catch{return null}};
 const preserve=()=>{const field=getCurrent();if(!field)return;journalAdd(field.value,"idea");try{sessionStorage.setItem(continuityKey,JSON.stringify({text:field.value.trim().slice(0,4000),source:page,updated:Date.now()}))}catch{}};
 nav.addEventListener("click",event=>{const link=event.target.closest("a");if(!link)return;preserve();const destination=link.getAttribute("href")?.split("#")[0];const idea=active()?.text;if(!idea||!destination)return;try{if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:idea,created:Date.now()}));else if(["network.html","my-network.html","communities.html","campaigns.html","members.html","growth.html","request-build.html"].includes(destination))sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:idea,created:Date.now()}))}catch{}});
 const resumeFromAccount=async()=>{
  try{
   const store=window.SHANEConversationStore;
   if(!store)return;
   const entries=await store.recent(1);
   const latest=entries[0];
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
  const field=conversationSelectors.map(selector=>form.querySelector(selector)).find(element=>element&&typeof element.value==="string"&&element.value.trim())||Array.from(form.querySelectorAll("textarea")).find(element=>element.value.trim());
  if(field)journalAdd(field.value,"submitted-idea");
 },true);
 window.SHANECurrentEndeavor=Object.freeze({
  read:()=>{try{return JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id||null}catch{return null}},
  context:async()=>{const id=window.SHANECurrentEndeavor.read();if(!id||!window.SHANEConversationStore)return [];return window.SHANEConversationStore.endeavorContext(id)},
  continueIn:(destination,text)=>{const id=window.SHANECurrentEndeavor.read();const idea=String(text||journalRead().turns.at(-1)?.text||"").trim();if(!idea)return false;sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:idea,endeavorId:id,created:Date.now()}));return true}
 });
 document.addEventListener("shane:conversation-store-ready",async()=>{try{const entries=await window.SHANECurrentEndeavor.context();document.dispatchEvent(new CustomEvent("shane:endeavor-context-ready",{detail:{entries}}))}catch{}});
 const receiveIntent=()=>{
  try{
   const handoff=JSON.parse(sessionStorage.getItem("shane-intent-handoff-v1")||"null");
   if(!handoff||handoff.destination!==page||typeof handoff.text!=="string"||Date.now()-handoff.created>3600000)return;
   if(handoff.endeavorId&&!window.SHANECurrentEndeavor.read()&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(handoff.endeavorId))sessionStorage.setItem("shane-active-endeavor-v1",JSON.stringify({id:handoff.endeavorId,updated:Date.now()}));
   const preferred={"network.html":["#query"],"my-network.html":["#visionInput","#query"],"communities.html":["#description"],"campaigns.html":["#description"],"members.html":["#description"],"growth.html":["#shaneGrowthGoal"],"request-build.html":["#shaneBuildRequestGoal"]};
   const field=(preferred[page]||[]).map(selector=>document.querySelector(selector)).find(element=>element&&typeof element.value==="string"&&!element.value.trim());
   if(!field)return;
   field.value=handoff.text.slice(0,field.maxLength>0?field.maxLength:4000);
   field.dispatchEvent(new Event("input",{bubbles:true}));
   sessionStorage.removeItem("shane-intent-handoff-v1");
  }catch{}
 };
 receiveIntent();
 document.addEventListener("shane:conversation-saved",()=>document.dispatchEvent(new Event("shane:conversation-context-changed")));
 const remembered=active();
 if(remembered&&remembered.source!==page){const hint=document.createElement("p");hint.className="shane-conversation-resume";hint.setAttribute("role","status");hint.style.cssText="margin:8px 0;font:500 13px system-ui;color:inherit";
 const link=document.createElement("a");link.href="builder.html#shane-idea-conversation";link.textContent="Continue our earlier idea in the creator";
 link.addEventListener("click",()=>{try{sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:remembered.text,created:Date.now()}))}catch{}});
 hint.append("Your conversation can continue across SHANE. ",link);nav.append(hint)}
 if(header){header.append(nav)}else{const landmark=document.createElement("div");landmark.className="shane-unified-topbar";landmark.append(nav);document.body.insertBefore(landmark,document.body.firstChild)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();