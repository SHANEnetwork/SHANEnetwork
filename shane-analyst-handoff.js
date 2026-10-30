/* Present an owner-loaded Analyst handoff without pretending an AI review ran. */
(function(){
"use strict";
document.addEventListener("shane:analyst-context-ready",event=>{
 const ctx=event.detail;
 if(!ctx||ctx.role!=="analyst"||!ctx.endeavorId)return;
 let panel=document.getElementById("shaneAnalystContextPanel");
 if(!panel){
  panel=document.createElement("section");
  panel.id="shaneAnalystContextPanel";
  panel.style.cssText="max-width:900px;margin:18px auto;padding:20px;border:1px solid #b5cde4;border-radius:16px;background:#f5f9ff;color:#173454";
  const host=document.getElementById("shaneContinuityStatus")?.parentElement||document.querySelector("main")||document.body;
  host.append(panel);
 }
 panel.replaceChildren();
 const heading=document.createElement("h3");heading.textContent="Analyst workspace";
 const info=document.createElement("p");info.textContent="SHANE has prepared your existing endeavor for independent review. No AI assessment has been generated yet.";
 const title=document.createElement("p");title.textContent="Endeavor: "+ctx.title;
 const scope=document.createElement("p");scope.textContent="Review scope: feasibility, assumptions, costs, risks and evidence.";
 const details=document.createElement("p");details.textContent="Linked website: "+(ctx.linkedSiteId?"yes":"not yet")+" · Conversation turns: "+ctx.conversation.length;
 const copy=document.createElement("button");copy.type="button";copy.textContent="Copy review brief";
 copy.addEventListener("click",async()=>{
  const brief=["Review this SHANE endeavor independently. Distinguish evidence, assumptions and unknowns.","Title: "+ctx.title,"Vision: "+ctx.vision,"Requested scope: "+ctx.mandate,"Conversation: "+ctx.conversation.map(t=>t.role+": "+t.text).join("\n")].join("\n\n");
  try{await navigator.clipboard.writeText(brief);copy.textContent="Brief copied"}catch{copy.textContent="Copy unavailable"}
 });
 panel.append(heading,info,title,scope,details,copy);
});
})();