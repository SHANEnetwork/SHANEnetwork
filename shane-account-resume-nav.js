/* One account-backed endeavor selector in SHANE's existing navigation.
   Switching an endeavor never publishes, deletes, or overwrites a draft. */
(()=>{"use strict";
const UUID=/^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
const key="shane-active-endeavor-v1";
function active(){try{const id=JSON.parse(sessionStorage.getItem(key)||"null")?.id;return UUID.test(id||"")?id:null}catch{return null}}
async function init(){
 const nav=document.querySelector(".shane-unified-nav");if(!nav)return;
 let store=window.SHANEConversationStore;
 if(!store){
  await new Promise(resolve=>{let done=false;const finish=()=>{if(!done){done=true;resolve()}};document.addEventListener("shane:conversation-store-ready",finish,{once:true});setTimeout(finish,3500)});
  store=window.SHANEConversationStore;
 }
 if(!store)return;
 try{
  const account=await store.connectedUser();if(!account)return;
  const [endeavors,latest]=await Promise.all([store.endeavors(),store.list({limit:40})]);
  const ideas=latest.filter(row=>typeof row.body==="string"&&row.body.trim()&&["idea","vision","submitted-idea","community-vision","campaign-vision","listing-vision"].includes(row.entry_kind));
  const chooser=document.createElement("select");chooser.className="shane-endeavor-switcher";chooser.setAttribute("aria-label","Choose your saved SHANE endeavor");
  const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="My saved endeavors";chooser.append(placeholder);
  for(const endeavor of endeavors){if(!UUID.test(endeavor.id))continue;const option=document.createElement("option");option.value=endeavor.id;option.textContent=(endeavor.title||"Untitled endeavor").slice(0,80);chooser.append(option)}
  const current=active();if(current&&endeavors.some(e=>e.id===current))chooser.value=current;
  if(endeavors.length){
   nav.append(chooser);
   chooser.addEventListener("change",()=>{
    const id=chooser.value;
    if(!id)return;
    try{sessionStorage.setItem(key,JSON.stringify({id,updated:Date.now()}))}catch{}
    document.dispatchEvent(new CustomEvent("shane:active-endeavor-changed",{detail:{id}}));
   });
  }
  const resume=document.createElement("a");resume.className="shane-saved-resume-link";resume.href="builder.html#shane-idea-conversation";resume.textContent="Continue saved idea";
  const chooseIdea=()=>{
   const id=chooser.value||active();
   return (id?ideas.find(row=>row.endeavor_id===id):null)||(!id?ideas[0]:null);
  };
  if(ideas.length||endeavors.length){
   nav.append(resume);
   resume.addEventListener("click",event=>{
    const id=chooser.value||active(),idea=chooseIdea();
    if(!id&&!idea){event.preventDefault();return}
    if(id&&UUID.test(id)){try{sessionStorage.setItem(key,JSON.stringify({id,updated:Date.now()}))}catch{}}
    if(idea){try{sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:idea.body.slice(0,4000),created:Date.now()}))}catch{}}
    if(!idea&&id)resume.href="builder.html?endeavor="+encodeURIComponent(id)+"#shane-idea-conversation";
   });
  }
 }catch{/* Public navigation stays available without a connected account or data. */}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>void init(),{once:true});else void init();
})();