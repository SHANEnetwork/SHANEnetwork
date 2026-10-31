/* Shared SHANE wayfinding. Existing application content and navigation remain intact. */
(()=>{"use strict";function init(){
 const header=document.querySelector("body > header, header");if(document.querySelector(".shane-unified-nav"))return;
 const nav=document.createElement("nav");nav.className="shane-unified-nav";nav.setAttribute("aria-label","SHANE shared navigation");
 const items=[["Imagine","index.html#create"],["Create together","builder.html#shane-idea-conversation"],["My endeavors","dashboard.html"],["Discover","network.html"],["People & messages","members.html"],["Communities","communities.html"],["Collaborate","my-network.html"],["Campaigns","campaigns.html"]];
 const page=location.pathname.split("/").pop()||"index.html";
 for(const [label,url] of items){const a=document.createElement("a");a.href=url;a.textContent=label;if(url.split("#")[0]===page)a.setAttribute("aria-current","page");nav.append(a)}
 if(header){header.append(nav)}else{const landmark=document.createElement("div");landmark.className="shane-unified-topbar";landmark.append(nav);document.body.insertBefore(landmark,document.body.firstChild)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();