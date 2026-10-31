/* Conversation-first preparation for existing community publishing and opportunity forms.
   No permission checks, publishing, or submission handlers are replaced. */
(()=>{"use strict";
const pages={
"community-feed.html":{form:"publishForm",target:"publishPanel",title:"publishTitle",body:"publishBody",kind:"publishKind",heading:"What would you like your community to know?",hint:"Describe an announcement or event. I'll prepare the existing publication form; you decide whether to publish."},
"community-opportunities.html":{form:"create",target:"create",title:"title",body:"description",heading:"What could people do together?",hint:"Describe a volunteer role, shared activity, or opportunity. I'll prepare the existing community form."}
};
function init(){const page=location.pathname.split("/").pop(),cfg=pages[page];if(!cfg)return;const form=document.getElementById(cfg.form);if(!form)return;
const panel=document.createElement("section");panel.className="shane-conversation-intake";panel.id="shaneCommunityIntent";panel.innerHTML='<h2></h2><p></p><label for="shaneCommunityVision">Describe it in your own words</label><textarea id="shaneCommunityVision" rows="3" maxlength="4000" placeholder="We would love to bring neighbors together for a Saturday cleanup and picnic…"></textarea><div class="shane-conversation-actions"><button type="button" id="shaneCommunityDraft">Prepare the details</button><span id="shaneCommunityDraftStatus" role="status" aria-live="polite"></span></div>';
panel.querySelector("h2").textContent=cfg.heading;panel.querySelector("p").textContent=cfg.hint;
const host=page==="community-feed.html"?document.getElementById("publishPanel"):form;
host.parentNode.insertBefore(panel,host);
try{const raw=sessionStorage.getItem("shane-intent-handoff-v1");if(raw){const item=JSON.parse(raw),input=panel.querySelector("textarea");if(item&&item.destination===page&&typeof item.text==="string"&&Date.now()-item.created<86400000&&!input.value.trim()){input.value=item.text.slice(0,4000);panel.querySelector("#shaneCommunityDraftStatus").textContent="Your shared idea is ready for draft preparation. Nothing has been published.";sessionStorage.removeItem("shane-intent-handoff-v1")}}}catch{}
panel.querySelector("button").addEventListener("click",()=>{const text=panel.querySelector("textarea").value.trim();if(!text){panel.querySelector("textarea").focus();return}
if(host.hidden){panel.querySelector("#shaneCommunityDraftStatus").textContent="Sign in with a community owner or coordinator account to prepare this publication.";return}
const first=text.split(/[.!?\n]/).map(x=>x.trim()).find(Boolean)||text;
const title=document.getElementById(cfg.title),body=document.getElementById(cfg.body);
if(title&&!title.value.trim())title.value=first.replace(/^(?:we (?:want|would like|hope) to |i (?:want|would like|hope) to |please |let's )/i,"").slice(0,160);
if(body&&!body.value.trim())body.value=text.slice(0,body.maxLength||4000);
if(cfg.kind){const select=document.getElementById(cfg.kind);if(select)select.value=/\b(event|concert|festival|gathering|meeting|fair|picnic|workshop)\b/i.test(text)?"event":"announcement"}
panel.querySelector("#shaneCommunityDraftStatus").textContent="Draft prepared. Review the community, details, and permissions before publishing.";
form.scrollIntoView({behavior:"smooth",block:"center"});
});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();