/* SHANE's conversation-first doorway for Network and collaboration pages.
   Uses the existing creator handoff; never publishes, invites or overwrites drafts. */
(()=>{"use strict";
const path=location.pathname.split("/").pop().toLowerCase();
const settings={
 "members.html":{title:"Every endeavor begins with a conversation.",subtitle:"Tell SHANE what you want to build or who you hope to work with. We'll begin privately, then bring the right Network tools into the journey.",placeholder:"I want to create a community garden and meet people who can help bring it to life…"},
 "workspace.html":{title:"Keep building together.",subtitle:"Your shared work belongs to an ongoing story. Describe the next step and continue creating with SHANE.",placeholder:"Let's turn our collaboration into a welcoming website and a plan for our next event…"},
 "my-network.html":{title:"Imagine it. Build it. Find your people.",subtitle:"SHANE brings your vision into creation, and the Network connects it to people and possibilities.",placeholder:"I want to launch a local music collective with events, a website, and collaborators…"},
 "dashboard.html":{title:"Your next chapter starts here.",subtitle:"Return to saved work or tell SHANE what you'd like to make next. Your creation stays private until you decide to share.",placeholder:"I want to improve my project's website and plan a new gathering…"}
};
const config=settings[path];if(!config)return;
function init(){
 if(document.getElementById("shane-conversation-doorway"))return;
 const main=document.querySelector("main"),firstHeading=document.querySelector("h1");
 if(!main&&!firstHeading)return;
 const section=document.createElement("section");section.id="shane-conversation-doorway";section.setAttribute("aria-label","Create with SHANE in conversation");
 const title=document.createElement("h2");title.textContent=config.title;
 const subtitle=document.createElement("p");subtitle.textContent=config.subtitle;
 const form=document.createElement("form");form.setAttribute("aria-label","Describe your endeavor");
 const label=document.createElement("label");label.textContent="What would you love to create?";label.htmlFor="shane-doorway-vision";
 const input=document.createElement("textarea");input.id="shane-doorway-vision";input.maxLength=12000;input.required=true;input.minLength=20;input.rows=3;input.placeholder=config.placeholder;
 const actions=document.createElement("div");actions.className="shane-doorway-actions";
 const submit=document.createElement("button");submit.type="submit";submit.textContent="Create with SHANE";
 const saved=document.createElement("a");saved.href="my-endeavors.html";saved.textContent="Return to my endeavors";
 const note=document.createElement("p");note.className="shane-doorway-note";note.textContent="Your vision starts privately. Publishing and invitations always require your decision.";
 actions.append(submit,saved);form.append(label,input,actions,note);
 section.append(title,subtitle,form);
 if(main)main.insertAdjacentElement("afterbegin",section);else firstHeading.insertAdjacentElement("afterend",section);
 const status=document.createElement("p");status.setAttribute("role","status");status.className="shane-doorway-note";form.append(status);
 form.addEventListener("submit",async event=>{
  event.preventDefault();const vision=input.value.trim();
  if(vision.length<20){input.setCustomValidity("Please describe your idea in at least 20 characters.");input.reportValidity();return}input.setCustomValidity("");
  submit.disabled=true;status.textContent="Establishing your private endeavor and Network presence…";
  try{
   // Import the same account-backed creator used by the rest of SHANE. No builder detour.
   if(!window.SHANEConversationStore?.establishEndeavor)await import("./shane-conversation-store.js");
   const store=window.SHANEConversationStore;
   if(!store?.establishEndeavor)throw Error("The endeavor creator is not available.");
   const account=await store.connectedUser();
   if(!account){
    try{sessionStorage.setItem("shane_welcome_draft",vision)}catch{}
    status.textContent="Your vision is kept in this browser. Sign in through Members, then return here to establish it.";
    return;
   }
   const result=await store.establishEndeavor({vision,approved:true});
   if(!result.endeavorSaved)throw Error("The endeavor could not be saved.");
   if(result.networkDraftSaved){
    status.textContent="Your endeavor and private Network draft are saved. Nothing has been published.";
   }else{
    status.textContent="Your endeavor was saved, but its Network draft needs another attempt: "+(result.error||"Unknown error");
   }
   const destination=document.createElement("a");destination.href="my-endeavors.html?endeavor="+encodeURIComponent(result.endeavorId);
   destination.textContent="Open my saved endeavor";status.append(" ",destination);
   if(result.networkDraftSaved)location.assign(destination.href);
  }catch(error){status.textContent="SHANE could not establish the endeavor: "+String(error?.message||error)+". Your description remains here for retry."}
  finally{submit.disabled=false}
 });
 input.addEventListener("input",()=>input.setCustomValidity(""));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();