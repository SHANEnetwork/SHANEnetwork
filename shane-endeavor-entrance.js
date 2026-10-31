/* Endeavor-first entrance. Progressive enhancement; never publishes or contacts others. */
(function(){
"use strict";
const key="shane_network_vision_handoff_v1";
function init(){
 const form=document.getElementById("shane-entrance-form");
 const field=document.getElementById("shane-entrance-vision");
 const status=document.getElementById("shane-entrance-status");
 if(!form||!field)return;
 form.addEventListener("submit",function(event){
  event.preventDefault();
  const vision=field.value.trim();
  if(!vision){field.focus();status.textContent="Tell SHANE what you're imagining, even if it's only a few words.";return;}
  try{sessionStorage.setItem(key,JSON.stringify({vision,created:Date.now()}));}
  catch{status.textContent="Your browser could not preserve this message. Please keep a copy before continuing. Your writing is still here.";return;}
  location.assign("builder.html#vision-first");
 });
 document.querySelectorAll("[data-shane-starter]").forEach(function(button){
  button.addEventListener("click",function(){
   const suggestion=button.getAttribute("data-shane-starter");
   if(!field.value.trim())field.value=suggestion;
   field.focus();
  });
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
