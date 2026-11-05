/* Endeavor-centered dashboard continuity. A session ID is never proof of ownership. */
(()=>{"use strict";
const valid=id=>typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id);
async function init(){
 const status=document.getElementById("shaneActiveStatus"),host=document.getElementById("shaneActiveActions");
 if(!status||!host)return;
 host.replaceChildren();
 const requested=new URLSearchParams(location.search).get("endeavor");
 let stored=null;try{stored=JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id}catch{}
 const id=valid(requested)?requested:valid(stored)?stored:null;
 if(!id){status.textContent="Open an existing endeavor from My Endeavors or describe a new one above.";return}
 status.textContent="Checking the selected endeavor against your account…";
 try{
  const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm");
  const sb=createClient("https://ufxzogeixdwvbpdypojb.supabase.co","sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB");
  const {data:{user},error:authError}=await sb.auth.getUser();
  if(authError)throw authError;
  if(!user){status.textContent="Sign in to continue this private endeavor.";return}
  const {data:item,error}=await sb.from("shane_endeavors").select("id,title,idea").eq("id",id).eq("owner_id",user.id).maybeSingle();
  if(error)throw error;
  if(!item){status.textContent="This endeavor is not available to your account. Choose another from My Endeavors.";return}
  sessionStorage.setItem("shane-active-endeavor-v1",JSON.stringify({id:item.id,updated:Date.now()}));
  document.dispatchEvent(new CustomEvent("shane:active-endeavor-changed",{detail:{id:item.id}}));
  status.textContent="Continuing: "+(item.title||"Untitled endeavor")+". Your work remains private until you choose otherwise.";
  const actions=[
   ["Continue the endeavor","my-endeavors.html?endeavor="+encodeURIComponent(id)],
   ["Coordinate work","workspace.html?endeavor="+encodeURIComponent(id)],
   ["Find collaborators","members.html?endeavor="+encodeURIComponent(id)],
   ["Develop a community","communities.html?endeavor="+encodeURIComponent(id)],
   ["Organize an event","campaigns.html?endeavor="+encodeURIComponent(id)],
   ["Create its website","builder.html?endeavor="+encodeURIComponent(id)+"#vision-first"]
  ];
  for(const [label,url] of actions){const link=document.createElement("a");link.href=url;link.textContent=label;host.append(link)}
 }catch(error){status.textContent="Unable to verify your endeavor right now. No changes were made.";console.warn("SHANE endeavor continuity:",error)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>void init(),{once:true});else void init();
})();
