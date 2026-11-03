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
 form.addEventListener("submit",event=>{
  event.preventDefault();const vision=input.value.trim();if(vision.length<20){input.setCustomValidity("Please describe your idea in at least 20 characters.");input.reportValidity();return}input.setCustomValidity("");
  try{
   const created=Date.now();
   sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:vision,created}));
   sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination:"builder.html",text:vision,endeavorId:null,created,origin:path,visibility:"private"}));
  }catch{note.textContent="This browser could not preserve your vision for the creator. Copy your text before continuing.";return}
  location.assign("builder.html#vision-first");
 });
 input.addEventListener("input",()=>input.setCustomValidity(""));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();