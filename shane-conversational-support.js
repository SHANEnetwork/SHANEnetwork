/* Conversational preparation of contact and system reports. Existing forms own submission. */
(()=>{"use strict";
const pages={
"contact.html":{form:"contact",heading:"What would you like to tell SHANE?",hint:"Describe your question or idea. I'll prepare the email for your review; nothing is sent automatically.",title:null,body:"message"},
"system-health.html":{form:"report",heading:"What happened, and what should we investigate?",hint:"Describe the problem naturally. I'll prepare the existing incident report without submitting it.",title:"title",body:"description"}
};
function init(){const cfg=pages[location.pathname.split("/").pop()];if(!cfg)return;
const form=document.getElementById(cfg.form);if(!form)return;
const host=document.createElement("section");host.id="shaneSupportConversation";host.className="shane-conversation-intake";
host.innerHTML='<h2></h2><p></p><label for="shaneSupportIdea">Your message</label><textarea id="shaneSupportIdea" rows="4" maxlength="4000" placeholder="I would like to ask about…"></textarea><div class="shane-conversation-actions"><button id="shaneSupportPrepare" type="button">Prepare my message</button><span id="shaneSupportResponse" role="status" aria-live="polite"></span></div>';
host.querySelector("h2").textContent=cfg.heading;host.querySelector("p").textContent=cfg.hint;form.parentNode.insertBefore(host,form);
host.querySelector("button").addEventListener("click",()=>{const text=host.querySelector("textarea").value.trim();if(!text){host.querySelector("textarea").focus();return}
const body=document.getElementById(cfg.body);if(body&&!body.value.trim())body.value=text.slice(0,body.maxLength||4000);
if(cfg.title){const title=document.getElementById(cfg.title);if(title&&!title.value.trim())title.value=(text.split(/[.!?\n]/)[0]||text).slice(0,200)}
else{const topic=document.getElementById("topic");if(topic){const v=/\b(partner|collaborat|press|sponsor)\b/i.test(text)?"Partnerships and press":/\b(error|bug|broken|technical|crash)\b/i.test(text)?"Technical support":/\b(account|login|password|sign in)\b/i.test(text)?"Member accounts":/\b(privacy|safety|harass)\b/i.test(text)?"Privacy and safety":/\b(community|group|members)\b/i.test(text)?"Community and collaborations":/\b(builder|website|design|create)\b/i.test(text)?"Website builder":"General questions";const option=[...topic.options].find(x=>x.textContent===v);if(option)topic.value=option.value}}
host.querySelector("#shaneSupportResponse").textContent="Prepared below. Review the details and choose the existing submit action when ready.";
form.scrollIntoView({behavior:"smooth",block:"center"});
});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();