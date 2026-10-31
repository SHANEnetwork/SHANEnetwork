/* SHANE continuity bridge: carries a visitor's own words into the existing creator conversation.
   This module does not generate AI replies, submit, publish, or replace saved endeavors. */
(()=>{"use strict";
const KEY="shane-creative-handoff-v1";
const $=id=>document.getElementById(id);
function read(){let draft="";try{const raw=sessionStorage.getItem(KEY);if(raw){const item=JSON.parse(raw);if(item&&typeof item.text==="string"&&Date.now()-item.created<86400000)draft=item.text}if(!draft)draft=sessionStorage.getItem("shane_welcome_draft")||sessionStorage.getItem("shane_dashboard_goal")||""}catch{}return draft.slice(0,2000).trim()}
function clear(){try{sessionStorage.removeItem(KEY);sessionStorage.removeItem("shane_welcome_draft");sessionStorage.removeItem("shane_dashboard_goal")}catch{}}
function init(){const vision=$("visionPrompt"),reply=$("shaneIdeaReply");if(!vision||!reply)return;
const text=read();if(!text)return;try{window.SHANEConversation?.remember(text,"creator-handoff")}catch{}
const existing=vision.value.trim()||reply.value.trim();if(existing){if(existing===text)clear();return}
const notice=document.createElement("p");notice.id="shane-handoff-notice";notice.setAttribute("role","status");notice.className="shane-handoff-notice";
notice.textContent="I brought your idea here from the Network. It's ready to develop, and nothing has been published.";
const button=document.createElement("button");button.type="button";button.textContent="Dismiss";button.addEventListener("click",()=>notice.remove());notice.append(" ",button);
const target=$("shane-idea-conversation")||vision.closest("section");
if(target)target.insertBefore(notice,target.firstChild);
vision.value=text;vision.dispatchEvent(new Event("input",{bubbles:true}));clear();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();