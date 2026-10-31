/* Shared SHANE wayfinding. Existing application content and navigation remain intact. */
(()=>{"use strict";function init(){
 const header=document.querySelector("body > header, header");if(document.querySelector(".shane-unified-nav"))return;
 const nav=document.createElement("nav");nav.className="shane-unified-nav";nav.setAttribute("aria-label","SHANE shared navigation");
 const items=[["Imagine","index.html#create"],["Create together","builder.html#shane-idea-conversation"],["My endeavors","dashboard.html"],["Discover","network.html"],["People & messages","members.html"],["Communities","communities.html"],["Collaborate","my-network.html"],["Campaigns","campaigns.html"]];
 const page=location.pathname.split("/").pop()||"index.html";
 for(const [label,url] of items){const a=document.createElement("a");a.href=url;a.textContent=label;if(url.split("#")[0]===page)a.setAttribute("aria-current","page");nav.append(a)}
 const continuityKey="shane-conversation-continuity-v1";
 const conversationSelectors=["#visionPrompt","#shane-natural-prompt","#shaneDiscoveryWish","#shaneGrowthGoal","#shaneBuildRequestGoal","#shaneWorkspaceIdea","#shaneCommunityVision","#shaneMemberWelcome","#visionInput"];
 const getCurrent=()=>conversationSelectors.map(selector=>document.querySelector(selector)).find(element=>element&&typeof element.value==="string"&&element.value.trim());
 const active=()=>{try{const item=JSON.parse(sessionStorage.getItem(continuityKey)||"null");return item&&typeof item.text==="string"&&Date.now()-item.updated<86400000?item:null}catch{return null}};
 const preserve=()=>{const field=getCurrent();if(!field)return;try{sessionStorage.setItem(continuityKey,JSON.stringify({text:field.value.trim().slice(0,4000),source:page,updated:Date.now()}))}catch{}};
 nav.addEventListener("click",event=>{const link=event.target.closest("a");if(!link)return;preserve();const destination=link.getAttribute("href")?.split("#")[0];const idea=active()?.text;if(!idea||!destination)return;try{if(destination==="builder.html")sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:idea,created:Date.now()}));else if(["network.html","my-network.html","communities.html","campaigns.html","members.html"].includes(destination))sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:idea,created:Date.now()}))}catch{}});
 const remembered=active();
 if(remembered&&remembered.source!==page){const hint=document.createElement("p");hint.className="shane-conversation-resume";hint.setAttribute("role","status");hint.style.cssText="margin:8px 0;font:500 13px system-ui;color:inherit";
 const link=document.createElement("a");link.href="builder.html#shane-idea-conversation";link.textContent="Continue our earlier idea in the creator";
 link.addEventListener("click",()=>{try{sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:remembered.text,created:Date.now()}))}catch{}});
 hint.append("Your conversation can continue across SHANE. ",link);nav.append(hint)}
 if(header){header.append(nav)}else{const landmark=document.createElement("div");landmark.className="shane-unified-topbar";landmark.append(nav);document.body.insertBefore(landmark,document.body.firstChild)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();