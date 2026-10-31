/* Optional idea sparks for SHANE's continuous Creator. No forced selection or remote calls. */
(function(){
"use strict";
function init(){
 const input=document.getElementById("visionPrompt");
 const area=document.getElementById("shane-vision-sparks");
 if(!input||!area)return;
 area.addEventListener("click",function(e){
  const button=e.target.closest("button[data-spark]");
  if(!button)return;
  const suggestion=button.getAttribute("data-spark");
  if(!input.value.trim())input.value=suggestion;
  else if(!input.value.includes(suggestion))input.value=input.value.trim()+"\n"+suggestion;
  input.dispatchEvent(new Event("input",{bubbles:true}));
  input.focus();
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
