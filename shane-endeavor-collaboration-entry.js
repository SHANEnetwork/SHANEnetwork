/* Bring an owner-verified saved endeavor into SHANE's existing listing workflow.
   The listing remains a draft until its owner explicitly saves or publishes it. */
import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm";
const params=new URLSearchParams(location.search),endeavorId=params.get("endeavor");
if(endeavorId&&/^[0-9a-f-]{36}$/i.test(endeavorId)){
 const sb=createClient("https://ufxzogeixdwvbpdypojb.supabase.co","sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB");
 const section=document.getElementById("listingSection"),host=document.createElement("section");
 host.id="shane-endeavor-collaboration-context";
 host.style.cssText="background:#fff8f0;border:1px solid #d7b9b0;border-radius:18px;padding:22px;margin:20px 0";
 const title=document.createElement("h2"),message=document.createElement("p"),prepare=document.createElement("button");
 title.textContent="Bring your endeavor into the Network";
 message.setAttribute("role","status");message.setAttribute("aria-live","polite");
 message.textContent="Checking your account for the selected endeavor…";
 prepare.type="button";prepare.textContent="Prepare a collaboration listing";prepare.hidden=true;
 host.append(title,message,prepare);(section||document.querySelector("main")||document.body).insertAdjacentElement("beforebegin",host);
 let item=null;
 async function load(){
  try{
   const {data:{user},error:authError}=await sb.auth.getUser();
   if(authError)throw authError;
   if(!user){message.textContent="Sign in to prepare a collaboration listing for this endeavor. No project has been changed.";return}
   const {data,error}=await sb.from("shane_endeavors").select("id,title,idea,region").eq("id",endeavorId).eq("owner_id",user.id).maybeSingle();
   if(error)throw error;
   if(!data){message.textContent="This endeavor is not available in your account.";return}
   item=data;title.textContent="Find collaborators for "+(data.title||"your endeavor");
   message.textContent="SHANE can prepare a discoverable listing from your saved vision. You review it and choose whether to publish.";
   prepare.hidden=false;
  }catch(error){message.textContent="Could not retrieve this endeavor from your account. No listing has been created."}
 }
 prepare.addEventListener("click",()=>{
  if(!item)return;
  const fields=[["listingIdea",item.idea],["title",item.title],["description",item.idea],["listingRegion",item.region]];
  let preserved=false;
  for(const [name,value]of fields){const field=document.getElementById(name);if(!field||!value)continue;if(field.value.trim()){preserved=true;continue}field.value=String(value).slice(0,field.maxLength>0?field.maxLength:4000);field.dispatchEvent(new Event("input",{bubbles:true}))}
  const category=document.getElementById("category");if(category&&category.value==="business")category.value="project";
  message.textContent=preserved?"Existing listing edits were preserved. Review your prepared draft below. Nothing has been published.":"Your endeavor is ready as an editable listing draft. Review it before choosing to save or publish.";
  if(section){section.hidden=false;section.scrollIntoView({behavior:"smooth",block:"start"})}
 });
 sb.auth.onAuthStateChange(()=>{setTimeout(load,0)});await load();
}
