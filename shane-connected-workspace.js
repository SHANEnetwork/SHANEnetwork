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
 function remember(id){try{if(id)sessionStorage.setItem(CONTEXT,JSON.stringify({id,updated:new Date().toISOString()}));else sessionStorage.removeItem(CONTEXT)}catch{}}
 function currentId(){try{const x=JSON.parse(sessionStorage.getItem(CONTEXT)||"null");return typeof x?.id==="string"&&/^[a-f0-9-]{36}$/i.test(x.id)?x.id:null}catch{return null}}
 function updateContext(event){if(event?.detail&&Object.prototype.hasOwnProperty.call(event.detail,"id"))remember(event.detail.id)}
 document.addEventListener("shane:endeavor-changed",updateContext);
 const accountSelect=document.getElementById("savedEndeavors");
 if(accountSelect){accountSelect.addEventListener("change",()=>{if(accountSelect.value)status.textContent="Selected an endeavor. Open it to make it the active Network context."})}
 function open(kind,page){
  if(active===kind){shell.dataset.open="false";active="";host.querySelectorAll("button[data-kind]").forEach(b=>b.setAttribute("aria-pressed","false"));status.textContent="Network workspace minimized. Your creative conversation remains ready.";return}
  let url=page;
  if(kind==="discover"){const words=(vision.value.trim()||reply.value.trim()).replace(/[^\p{L}\p{N}\s-]/gu," ").split(/\s+/).filter(w=>w.length>3&&!/^(with|from|this|that|website|create|build|want|have|would|could|should|about|people)$/i.test(w)).slice(0,4);if(words.length)url+="?q="+encodeURIComponent(words.join(" "))}
  const id=currentId();if(id&&(kind==="endeavors"||kind==="campaigns"))url+=(url.includes("?")?"&":"?")+"endeavor="+encodeURIComponent(id);
  frame.src=url;direct.href=url;shell.dataset.open="true";active=kind;host.querySelectorAll("button[data-kind]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.kind===kind)));status.textContent="Showing "+kind+" inside your creative workspace. Your draft and conversation are unchanged.";
 }
 host.querySelectorAll("button[data-kind]").forEach(b=>{b.setAttribute("aria-pressed","false");b.addEventListener("click",()=>open(b.dataset.kind,b.dataset.page))});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();