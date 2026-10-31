/* Dashboard continuity uses only a local endeavor identifier. Database access remains account-controlled. */
(()=>{"use strict";
function init(){
const status=document.getElementById("shaneActiveStatus"),host=document.getElementById("shaneActiveActions");
if(!status||!host)return;
let item;try{item=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")}catch{}
const id=typeof item?.id==="string"&&/^[0-9a-f-]{36}$/i.test(item.id)?item.id:null;
if(!id){status.textContent="No active endeavor selected on this device. Open a saved endeavor or begin a new one.";return}
status.textContent="An endeavor is selected for this session. Your account permissions still control access.";
for(const [label,url] of [
["Continue creating","builder.html?endeavor="+encodeURIComponent(id)+"#shane-idea-conversation"],
["Find collaborators","network.html"],
["My collaborations","members.html#collaborationSection"]
]){
const link=document.createElement("a");link.href=url;link.textContent=label;host.append(link);
}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();