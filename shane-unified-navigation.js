/* Shared SHANE wayfinding. Existing application content and navigation remain intact. */
(()=>{"use strict";function init(){
 const header=document.querySelector("body > header, header");if(document.querySelector(".shane-unified-nav"))return;
 const nav=document.createElement("nav");nav.className="shane-unified-nav";nav.setAttribute("aria-label","SHANE shared navigation");
 const items=[["Imagine","index.html#create"],["Create together","builder.html#shane-idea-conversation"],["My endeavors","dashboard.html"],["Discover","network.html"],["People & messages","members.html"],["Communities","communities.html"],["Collaborate","my-network.html"],["Campaigns","campaigns.html"]];
 const page=location.pathname.split("/").pop()||"index.html";
 for(const [label,url] of items){const a=document.createElement("a");a.href=url;a.textContent=label;if(url.split("#")[0]===page)a.setAttribute("aria-current","page");nav.append(a)}
 const JOURNAL="shane-shared-conversation-v1";
 const journalRead=()=>{try{const x=JSON.parse(sessionStorage.getItem(JOURNAL)||"null");return x&&Array.isArray(x.turns)?x:{turns:[],updated:0}}catch{return {turns:[],updated:0}}};
 const journalAdd=(value,kind="idea")=>{const text=String(value||"").trim().slice(0,4000);if(!text)return;try{const j=journalRead(),last=j.turns[j.turns.length-1];if(last&&last.text===text&&last.page===page)return;j.turns.push({text,page,kind,at:Date.now()});j.turns=j.turns.slice(-30);j.updated=Date.now();sessionStorage.setItem(JOURNAL,JSON.stringify(j));document.dispatchEvent(new CustomEvent("shane:conversation-updated",{detail:{page,kind,text}}))}catch{}};
 const journalContext=()=>{const j=journalRead();return {page,turns:j.turns.slice(-12),updated:j.updated}};
 Object.defineProperty(window,"SHANEConversation",{configurable:false,value:Object.freeze({read:journalContext,remember:journalAdd})});
 import("./shane-conversation-store.js").catch(()=>{});
 const continuityKey="shane-conversation-continuity-v1";
 const conversationSelectors=["#visionPrompt","#shane-natural-prompt","#shaneDiscoveryWish","#shaneGrowthGoal","#shaneBuildRequestGoal","#shaneWorkspaceIdea","#shaneCommunityVision","#shaneMemberWelcome","#visionInput"];
 const getCurrent=()=>conversationSelectors.map(selector=>document.querySelector(selector)).find(element=>element&&typeof element.value==="string"&&element.value.trim());
 const active=()=>{try{const item=JSON.parse(sessionStorage.getItem(continuityKey)||"null");return item&&typeof item.text==="string"&&Date.now()-item.updated<86400000?item:null}catch{return null}};
 const preserve=()=>{const field=getCurrent();if(!field)return;journalAdd(field.value,"idea");try{sessionStorage.setItem(continuityKey,JSON.stringify({text:field.value.trim().slice(0,4000),source:page,updated:Date.now()}))}catch{}};
 nav.addEventListener("click",event=>{const link=event.target.closest("a");if(!link)return;preserve();const destination=link.getAttribute("href")?.split("#")[0];const idea=active()?.text;if(!idea||!destination)return;try{if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:idea,created:Date.now()}));else if(["network.html","my-network.html","communities.html","campaigns.html","members.html"].includes(destination))sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:idea,created:Date.now()}))}catch{}});
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
 const remembered=active();
 if(remembered&&remembered.source!==page){const hint=document.createElement("p");hint.className="shane-conversation-resume";hint.setAttribute("role","status");hint.style.cssText="margin:8px 0;font:500 13px system-ui;color:inherit";
 const link=document.createElement("a");link.href="builder.html#shane-idea-conversation";link.textContent="Continue our earlier idea in the creator";
 link.addEventListener("click",()=>{try{sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:remembered.text,created:Date.now()}))}catch{}});
 hint.append("Your conversation can continue across SHANE. ",link);nav.append(hint)}
 if(header){header.append(nav)}else{const landmark=document.createElement("div");landmark.className="shane-unified-topbar";landmark.append(nav);document.body.insertBefore(landmark,document.body.firstChild)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();