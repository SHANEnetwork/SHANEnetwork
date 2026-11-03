/* Keep the save-and-return step beside the creative conversation, without bypassing account checks. */
(()=>{"use strict";
function init(){
 const hub=document.getElementById("vision-first"),save=document.getElementById("saveEndeavorAccount"),websiteSave=document.getElementById("visionSave");
 if(!hub||!save)return;
 const wrap=document.createElement("section");wrap.id="shane-journey-save";wrap.setAttribute("aria-label","Keep creating later");
 wrap.style.cssText="margin:20px 0;padding:20px;border-radius:18px;background:#fffaf3;border:1px solid #dfc9bc;color:#453340";
 const heading=document.createElement("h3");heading.textContent="Keep your endeavor growing";
 const note=document.createElement("p");note.textContent="Save this endeavor privately to your account, then return whenever you like. Your website has its own separate save control.";
 const button=document.createElement("button");button.type="button";button.textContent="Save my endeavor to my account";
 const status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");
 const website=document.createElement("button");website.type="button";website.textContent="Save my website draft";website.style.cssText="margin-left:8px";
website.addEventListener("click",()=>{if(!websiteSave){status.textContent="Website saving is unavailable in this workspace.";return}if(websiteSave.disabled){status.textContent="Website saving is already in progress.";return}status.textContent="Opening the existing website save process. Your endeavor save is separate.";websiteSave.click()});
const library=document.createElement("a");library.href="my-endeavors.html";library.textContent="My saved endeavors";library.style.cssText="display:inline-block;margin:8px 0;color:#704760;font-weight:700";
 button.addEventListener("click",()=>{if(save.disabled){status.textContent="A save is already in progress.";return}status.textContent="Checking your account and saving your endeavor…";save.click()});
 document.addEventListener("shane:endeavor-account-saved",event=>{if(!event.detail?.id)return;status.textContent="Saved to your SHANE account. You can return and continue this endeavor later.";button.textContent="Save updates to my endeavor"});
 const collaborate=document.createElement("a");collaborate.href="members.html";collaborate.textContent="Find collaborators for this endeavor";collaborate.style.cssText="display:none;margin:8px 0 8px 20px;color:#704760;font-weight:700";
document.addEventListener("shane:endeavor-account-saved",event=>{const id=event.detail?.id;if(!id)return;collaborate.href="members.html?endeavor="+encodeURIComponent(id);collaborate.style.display="inline-block"});
wrap.append(heading,note,button,website,status,library,collaborate);hub.append(wrap);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();