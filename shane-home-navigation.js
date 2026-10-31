/* Preserve deep links to existing SHANE homepage sections while keeping the entrance concise. */
(function(){
"use strict";
function revealAnchor(){
 const hash=location.hash;
 if(!hash||hash.length<2)return;
 let target;
 try{target=document.getElementById(decodeURIComponent(hash.slice(1)));}catch{return;}
 const details=document.getElementById("shane-explore-details");
 if(!target||!details||!details.contains(target))return;
 details.open=true;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",revealAnchor,{once:true});else revealAnchor();
window.addEventListener("hashchange",revealAnchor);
})();
