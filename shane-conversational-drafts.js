/* SHANE conversational preparation: writes into existing forms, never bypasses their validation, publishing or permissions. */
(()=>{"use strict";
const configs={
"campaigns.html":{form:"create",heading:"Tell SHANE about the gathering or campaign you imagine",hint:"Describe the occasion, purpose, and place. I'll prepare a draft for you to review before publishing.",fields:["title","description","category","location"],kind:"campaign"},
"communities.html":{form:"form",heading:"What kind of community would you like to bring together?",hint:"Describe the people, purpose, and shared interests. I'll prepare the existing community form for your review.",fields:["name","description","category"],kind:"community"},
"members.html":{form:"listing",heading:"Tell SHANE what you'd like to share with the Network",hint:"Describe your project, service, skills, or opportunity. I'll prepare a listing draft without publishing it.",fields:["title","description","category"],kind:"listing"}
};
function init(){const page=location.pathname.split("/").pop();const config=configs[page];if(!config)return;
const target=document.getElementById(config.form);if(!target||document.getElementById("shane-natural-intake"))return;
const section=document.createElement("section");section.id="shane-natural-intake";section.className="shane-conversation-intake";section.innerHTML='<h2></h2><p></p><label for="shane-natural-prompt">Your vision, in your own words</label><textarea id="shane-natural-prompt" rows="4" maxlength="4000" placeholder="I want to bring people together around…"></textarea><div class="shane-conversation-actions"><button type="button" id="shane-natural-prepare">Prepare my draft</button><span id="shane-natural-response" role="status" aria-live="polite"></span></div>';
section.querySelector("h2").textContent=config.heading;section.querySelector("p").textContent=config.hint;
const host=target.closest("section")||target;host.parentNode.insertBefore(section,host);
const details=document.createElement("details");details.className="shane-manual-details";const summary=document.createElement("summary");summary.textContent="Review and complete the prepared details";details.append(summary);target.parentNode.insertBefore(details,target);details.append(target);
function field(id){return target.querySelector("#"+id)}
function set(id,value){const el=field(id);if(!el||!value)return;el.value=value;el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))}
function classify(text,select){if(!select)return;const t=text.toLowerCase();const rules=config.kind==="campaign"?[["concert",/concert|music|band|gig|performance/],["fair",/fair|market|festival|bazaar/],["conference",/conference|symposium|summit/],["advertising",/advertis|promot|marketing/]]:config.kind==="community"?[["arts",/art|music|painting|creative/],["sports",/sport|team|league/],["research",/research|science|experiment/],["gaming",/game|gaming/],["business",/business|entrepreneur|shop/]]:[["service",/service|consult|repair|assist/],["person",/skill|mentor|freelanc/],["event",/event|festival|concert/],["business",/business|shop|store/],["organization",/nonprofit|organization|association/]];
for(const [v,re] of rules){if(re.test(t)){const option=[...select.options].find(o=>o.value.toLowerCase()===v||o.textContent.toLowerCase()===v);if(option){set("category",option.value);break}}}}
function consumeHandoff(){try{const raw=sessionStorage.getItem("shane-intent-handoff-v1");if(!raw)return;const item=JSON.parse(raw);if(!item||item.destination!==page||typeof item.text!=="string"||Date.now()-item.created>86400000)return;const prompt=section.querySelector("textarea");if(prompt.value.trim())return;prompt.value=item.text.slice(0,4000);section.querySelector("#shane-natural-response").textContent="Your vision arrived from the Network. Choose Prepare my draft to continue; nothing has been published.";sessionStorage.removeItem("shane-intent-handoff-v1")}catch{}}
consumeHandoff();
section.querySelector("button").addEventListener("click",()=>{const raw=section.querySelector("textarea").value.trim();if(!raw){section.querySelector("textarea").focus();return}if(config.kind==="listing"&&host.hidden){section.querySelector("#shane-natural-response").textContent="Sign in and open your listing editor before preparing a listing.";return}
const first=raw.split(/[.!?\n]/).map(s=>s.trim()).find(Boolean)||raw;
const title=first.replace(/^(i (?:want|would like|hope|plan|need) to |we (?:want|would like|plan) to |help me (?:start|create|organize|build) |create |start |organize )/i,"").trim().slice(0,config.kind==="campaign"?160:120);
if(config.kind==="campaign"){set("title",title);set("description",raw);const place=raw.match(/(?:in|at|near) ([A-Z][\w -]{2,55})(?:[,.]|$)/);if(place)set("location",place[1].trim())}
else if(config.kind==="community"){set("name",title);set("description",raw)}
else{set("title",title);set("description",raw)}
classify(raw,field("category"));details.open=true;
section.querySelector("#shane-natural-response").textContent="Draft prepared below. Review the details, then use the existing save or publish action when you're ready.";
target.scrollIntoView({behavior:"smooth",block:"start"});
});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();