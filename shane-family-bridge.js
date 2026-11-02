/* SHANE family integration contract. No cross-site account or private-data sharing. */
(()=>{"use strict";
const integrations=Object.freeze({
 shane:Object.freeze({label:"SHANE creation",url:"builder.html#vision-first",description:"Build and refine a personal endeavor"}),
 network:Object.freeze({label:"SHANE Network",url:"network.html",description:"Create and join shared endeavors without a personal website"}),
 shon:Object.freeze({label:"SHONnetwork",url:"https://shonnetwork.org",description:"Independent housing-focused network; separate accounts and data"})
});
function find(key){return Object.prototype.hasOwnProperty.call(integrations,key)?integrations[key]:null}
async function startSharedEndeavor(text){
 const idea=String(text||"").trim();
 if(!idea)return false;
 if(idea.length>10000)throw new Error("Please shorten your idea to 10,000 characters.");
 const created=Date.now();
 try{
 sessionStorage.setItem("shane-shared-idea-draft-v2:personal",idea);
 sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:idea,created}));
 sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination:"builder.html",text:idea,endeavorId:null,created,origin:"network",visibility:"private"}));
 }catch(e){throw new Error("Your browser cannot save this draft. Please allow session storage before continuing.")}
 let savedId=null;
 try{
  const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm");
  const sb=createClient("https://ufxzogeixdwvbpdypojb.supabase.co","sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB");
  const {data:{user},error:authError}=await sb.auth.getUser();
  if(!authError&&user){
   const payload={owner_id:user.id,title:idea.split(/[.!?]/)[0].slice(0,90)||"My Network endeavor",idea,region:"",audience:"",resources:"",plan:""};
   const result=await sb.from("shane_endeavors").insert(payload).select("id").single();
   if(result.error)throw result.error;
   savedId=result.data.id;
   sessionStorage.setItem("shane-active-endeavor-v1",JSON.stringify({id:savedId,origin:"network"}));
  }
 }catch(error){
  const status=document.getElementById("shane-network-idea-status");
  if(status)status.textContent="Account save unavailable. Your idea remains in this browser; save it from SHANE after signing in.";
  if(error?.message)console.warn("SHANE Network private save:",error.message);
 }
 if(savedId){
  const status=document.getElementById("shane-network-idea-status");
  if(status)status.textContent="Saved privately to your SHANE account. Opening your endeavor…";
 }
 location.assign("builder.html#vision-first");
 return true;
}
window.SHANEFamily=Object.freeze({find,startSharedEndeavor,integrations});
})();
