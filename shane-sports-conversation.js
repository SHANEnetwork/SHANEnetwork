/* Sports district preview: interpret a vision into demo controls only, not security policies. */
(()=>{"use strict";function init(){const button=document.getElementById("shaneSportsPrepare");if(!button)return;
button.addEventListener("click",()=>{const field=document.getElementById("shaneSportsGoal"),text=field.value.trim().toLowerCase();if(!text){field.focus();return}
const set=(id,value)=>{const select=document.getElementById(id);if(!select)return;const option=[...select.options].find(x=>x.value===value);if(option){select.value=value;select.dispatchEvent(new Event("change",{bubbles:true}))}};
if(/invitation|invite.only|approved members/.test(text))set("membership","invitation");
else if(/verified|school members/.test(text))set("membership","verified");
else if(/open registration/.test(text))set("membership","open");
if(/no chat|disable rooms|without chat/.test(text))set("rooms","off");else if(/chat|conversation|discussion|rooms/.test(text))set("rooms","on");
if(/no friend|disable connections/.test(text))set("friends","off");else if(/friend|connect/.test(text))set("friends","mutual");
if(/no private message|disable messages/.test(text))set("pager","off");else if(/message|pager/.test(text))set("pager","connections");
if(/private profiles|admin.only profiles/.test(text))set("profileVisibility","private");else if(/public profiles/.test(text))set("profileVisibility","public");else if(/member profiles/.test(text))set("profileVisibility","members");
document.getElementById("shaneSportsResponse").textContent="Demonstration settings prepared. Review and save the preview configuration below. No live access policy has changed.";
document.getElementById("organization-config").scrollIntoView({behavior:"smooth",block:"start"});
})}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init()})();