/* Progressive homepage bridge. Existing welcome submission and builder intake remain authoritative. */
(()=>{"use strict";
function init(){
 const welcome=document.getElementById("shane-home-create");
 if(!welcome)return;
 const links=document.createElement("nav");links.setAttribute("aria-label","Continue your SHANE journey");links.className="shane-journey-links";
 links.style.cssText="display:flex;flex-wrap:wrap;gap:12px 22px;margin-top:20px;padding-top:18px;border-top:1px solid #e6d2c9";
 const paths=[["Return to my endeavors","dashboard.html"],["Find collaborators","network.html"],["Open my conversations","my-network.html"],["Explore communities","communities.html"]];
 for(const [label,href] of paths){const a=document.createElement("a");a.href=href;a.textContent=label;a.style.cssText="color:#76506a;font-weight:650";links.append(a)}
 welcome.append(links);
 const idea=welcome.querySelector("textarea");if(!idea)return;
 const note=document.createElement("p");note.style.cssText="color:#70576a;font-size:.91rem;margin:12px 0 0";
 note.textContent="Your idea moves directly into SHANE’s creation conversation. You can refine it there before publishing.";
 idea.insertAdjacentElement("afterend",note);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();