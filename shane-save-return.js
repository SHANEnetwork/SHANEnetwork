/* Keep the save-and-return step beside the creative conversation, without bypassing account checks. */
(()=>{"use strict";
function init(){
 const hub=document.getElementById("vision-first"),save=document.getElementById("saveEndeavorAccount");
 if(!hub||!save)return;
 const wrap=document.createElement("section");wrap.id="shane-journey-save";wrap.setAttribute("aria-label","Keep creating later");
 wrap.style.cssText="margin:20px 0;padding:20px;border-radius:18px;background:#fffaf3;border:1px solid #dfc9bc;color:#453340";
 const heading=document.createElement("h3");heading.textContent="Keep your endeavor growing";
 const note=document.createElement("p");note.textContent="Save this endeavor privately to your account, then return whenever you like. Your website has its own separate save control.";
 const button=document.createElement("button");button.type="button";button.textContent="Save my endeavor to my account";
 const status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");
 const library=document.createElement("a");library.href="my-endeavors.html";library.textContent="My saved endeavors";library.style.cssText="display:inline-block;margin:8px 0;color:#704760;font-weight:700";
 button.addEventListener("click",()=>{if(save.disabled){status.textContent="A save is already in progress.";return}status.textContent="Checking your account and saving your endeavor…";save.click()});
 document.addEventListener("shane:endeavor-account-saved",event=>{if(!event.detail?.id)return;status.textContent="Saved to your SHANE account. You can return and continue this endeavor later.";button.textContent="Save updates to my endeavor"});
 wrap.append(heading,note,button,status,library);hub.append(wrap);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();