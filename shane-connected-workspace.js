/* A single in-page network surface, reusing existing working SHANE applications. */
(()=>{"use strict";
function init(){
 const hub=document.getElementById("shane-idea-conversation"),reply=document.getElementById("shaneIdeaReply"),vision=document.getElementById("visionPrompt");if(!hub||!reply||!vision)return;
 const host=document.createElement("section");host.id="shane-connected-workspace";host.setAttribute("aria-label","Connected SHANE workspace");
 host.innerHTML='<style>#shane-connected-workspace{margin:20px 0;padding:18px;border:1px solid #dec7cc;border-radius:22px;background:linear-gradient(130deg,#fffaf4,#f9f0f7)}#shane-connected-workspace h3{margin:0 0 8px;color:#69465f;font:700 1.5rem Georgia,serif}#shane-connected-workspace p{color:#695767}#shane-connected-workspace .actions{display:flex;gap:8px;flex-wrap:wrap}#shane-connected-workspace button{background:#76516a;color:white;border:0;border-radius:24px;padding:10px 14px;cursor:pointer;font:600 14px system-ui}#shane-connected-workspace button[aria-pressed=true]{background:#b25e74}#shane-connected-workspace .frame{display:none;margin-top:15px;border:1px solid #e2cfd7;border-radius:14px;overflow:hidden;background:white}#shane-connected-workspace .frame[data-open=true]{display:block}#shane-connected-workspace iframe{display:block;width:100%;height:min(70vh,720px);min-height:420px;border:0}#shane-connected-workspace .frame a{display:inline-block;padding:9px 15px;color:#69465f;font-weight:600}#shane-connected-workspace button:focus-visible{outline:3px solid #d38b2e;outline-offset:3px}</style><h3>Your network, alongside our conversation</h3><p>Discover collaborators, revisit endeavors, and follow conversations without leaving your creative draft. SHANE keeps these existing tools connected in one place.</p><div class="actions" role="group" aria-label="Explore connected tools"><button type="button" data-page="network.html" data-kind="discover">Discover</button><button type="button" data-page="dashboard.html" data-kind="endeavors">My endeavors</button><button type="button" data-page="my-network.html" data-kind="messages">Connections & messages</button><button type="button" data-page="communities.html" data-kind="communities">Communities</button><button type="button" data-page="campaigns.html" data-kind="campaigns">Campaigns & events</button></div><p id="shane-connected-status" role="status">Choose a Network capability. Your website draft stays here.</p><div class="frame" id="shane-connected-frame"><a id="shane-connected-direct" href="network.html" target="_blank" rel="noopener">Open this workspace in a full tab</a><iframe title="Connected SHANE Network workspace" loading="lazy"></iframe></div>';
 hub.append(host);
 const frame=host.querySelector("iframe"),shell=host.querySelector(".frame"),direct=host.querySelector("#shane-connected-direct"),status=host.querySelector("#shane-connected-status");
 let active="";
 const CONTEXT="shane-active-endeavor-v1";
 function remember(id){try{if(typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id))sessionStorage.setItem(CONTEXT,JSON.stringify({id,updated:new Date().toISOString()}));else sessionStorage.removeItem(CONTEXT)}catch{}}
 function currentId(){try{const x=JSON.parse(sessionStorage.getItem(CONTEXT)||"null");return typeof x?.id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(x.id)?x.id:null}catch{return null}}
 let displayedId=currentId();
 function updateContext(event){if(!event?.detail||!Object.prototype.hasOwnProperty.call(event.detail,"id"))return;const announced=event.detail.id;const selectedBefore=currentId();if(announced===selectedBefore)return;if(announced!==null&&(typeof announced!=="string"||!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(announced)))return;remember(announced);const selected=currentId();if(active&&displayedId!==selected){const button=host.querySelector('button[data-kind="'+active+'"]');if(button){active="";open(button.dataset.kind,button.dataset.page);status.textContent="Switched the connected Network workspace to your selected endeavor.";}}}
 document.addEventListener("shane:endeavor-changed",updateContext);
 document.addEventListener("shane:active-endeavor-changed",updateContext);
 document.addEventListener("shane:endeavor-context-ready",event=>{if(!active)return;const announced=event?.detail?.endeavorId;if(announced&&announced!==currentId())return;const selected=currentId();if(selected===displayedId)return;const button=host.querySelector('button[data-kind="'+active+'"]');if(!button)return;active="";open(button.dataset.kind,button.dataset.page);status.textContent="Connected Network workspace synchronized with your saved endeavor.";});
 const accountSelect=document.getElementById("savedEndeavors");
 if(accountSelect){accountSelect.addEventListener("change",()=>{if(accountSelect.value)status.textContent="Selected an endeavor. Open it to make it the active Network context."})}
 function open(kind,page){
  if(active===kind){shell.dataset.open="false";active="";host.querySelectorAll("button[data-kind]").forEach(b=>b.setAttribute("aria-pressed","false"));status.textContent="Network workspace minimized. Your creative conversation remains ready.";return}
  let url=page;
  if(kind==="discover"){const words=(vision.value.trim()||reply.value.trim()).replace(/[^\p{L}\p{N}\s-]/gu," ").split(/\s+/).filter(w=>w.length>3&&!/^(with|from|this|that|website|create|build|want|have|would|could|should|about|people)$/i.test(w)).slice(0,4);if(words.length)url+="?q="+encodeURIComponent(words.join(" "))}
  const id=currentId();displayedId=id;if(id)url+=(url.includes("?")?"&":"?")+"endeavor="+encodeURIComponent(id);
  frame.src=url;direct.href=url;shell.dataset.open="true";active=kind;host.querySelectorAll("button[data-kind]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.kind===kind)));status.textContent="Showing "+kind+" inside your creative workspace. Your draft and conversation are unchanged.";
 }
 host.querySelectorAll("button[data-kind]").forEach(b=>{b.setAttribute("aria-pressed","false");b.addEventListener("click",()=>open(b.dataset.kind,b.dataset.page))});
 // Explicit requests in the creative prompt can bring the appropriate existing
 // workspace alongside the draft; ordinary brainstorming remains untouched.
 const guide=document.getElementById("visionGuide");
 if(guide)guide.addEventListener("click",()=>{
  const request=vision.value.trim().toLowerCase();
  const routes=[
   {kind:"messages",match:/\b(?:open|show|view|check)\s+(?:my\s+)?(?:messages|inbox|conversations|connections)\b/},
   {kind:"endeavors",match:/\b(?:open|show|view|find)\s+(?:my\s+)?(?:saved\s+)?(?:projects|endeavors|websites)\b/},
   {kind:"discover",match:/\b(?:find|discover|search\s+for|look\s+for)\s+(?:some\s+)?(?:collaborators|partners|members|people\s+to\s+work\s+with)\b/},
   {kind:"communities",match:/\b(?:open|show|browse|find)\s+(?:my\s+)?communities\b/},
   {kind:"campaigns",match:/\b(?:open|show|browse|find)\s+(?:my\s+)?(?:campaigns|events)\b/}
  ];
  const route=routes.find(item=>item.match.test(request));
  if(route)document.dispatchEvent(new CustomEvent("shane:conversation-network-intent",{detail:{kind:route.kind}}));
 });
 // Conversation-driven workspace navigation reuses the same guarded in-page tools.
 // It does not send messages, publish listings, or alter a saved website.
 document.addEventListener("shane:conversation-network-intent",event=>{
  const kind=event?.detail?.kind;
  const button=typeof kind==="string"?host.querySelector('button[data-kind="'+kind.replace(/[^a-z-]/g,"")+'"]'):null;
  if(!button||button.dataset.kind!==kind)return;
  if(active!==kind)open(kind,button.dataset.page);
  else status.textContent="Your "+kind+" workspace is already open alongside this conversation.";
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();