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
  const studio=document.createElement("section");studio.id="shane-endeavor-creation-studio";studio.style.cssText="margin-top:20px;padding:22px;border:1px solid #dec6c0;border-radius:20px;background:#fffaf3";
  const heading=document.createElement("h3");heading.textContent="Create something for this endeavor";
  const explanation=document.createElement("p");explanation.textContent="Describe what this endeavor needs next. SHANE creates a private, saved draft linked to this endeavor's ongoing work. You decide whether to publish or invite anyone.";
  const form=document.createElement("form");form.style.cssText="display:grid;gap:12px";
  const choice=document.createElement("select");choice.setAttribute("aria-label","What should SHANE create?");
  for(const [value,label] of [["listing","Network opportunity or collaboration listing"],["community","Community or association"],["campaign","Event or campaign"],["new-website","Website for this endeavor"]]){const option=document.createElement("option");option.value=value;option.textContent=label;choice.append(option)}
  const request=document.createElement("textarea");request.rows=4;request.maxLength=12000;request.required=true;request.minLength=8;request.placeholder="Describe the outcome you want, the people it serves, and what should be created…";request.style.cssText="width:100%;box-sizing:border-box;padding:12px;border-radius:12px";
  const deadline=document.createElement("input");deadline.type="datetime-local";deadline.setAttribute("aria-label","Interest deadline for event or campaign");deadline.hidden=true;
  choice.addEventListener("change",()=>{deadline.hidden=choice.value!=="campaign";deadline.required=choice.value==="campaign"});
  const create=document.createElement("button");create.type="submit";create.textContent="Create and save private draft";
  const outcome=document.createElement("p");outcome.setAttribute("role","status");
  form.append(choice,request,deadline,create,outcome);studio.append(heading,explanation,form);host.append(studio);
  form.addEventListener("submit",async event=>{
   event.preventDefault();if(!request.reportValidity()||!deadline.reportValidity())return;
   create.disabled=true;outcome.textContent="Creating and saving for "+(item.title||"this endeavor")+"…";
   try{
    if(!window.SHANEConversationStore?.executeVision)await import("./shane-conversation-store.js");
    const store=window.SHANEConversationStore;if(!store?.executeVision)throw Error("Creation engine unavailable.");
    const result=await store.executeVision({type:choice.value,vision:request.value.trim(),endeavorId:item.id,deadline:choice.value==="campaign"?deadline.value:undefined});
    outcome.textContent="Saved privately for your endeavor. Nothing was published.";
    if(result.url){const link=document.createElement("a");link.href=result.url;link.textContent="Open saved creation";outcome.append(" ",link)}
    document.dispatchEvent(new CustomEvent("shane:endeavor-creation-saved",{detail:{endeavorId:item.id,type:choice.value}}));
   }catch(error){outcome.textContent="Creation was not confirmed: "+String(error?.message||error)+". Your description remains available."}
   finally{create.disabled=false}
  });

 }catch(error){status.textContent="Unable to verify your endeavor right now. No changes were made.";console.warn("SHANE endeavor continuity:",error)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>void init(),{once:true});else void init();
})();
