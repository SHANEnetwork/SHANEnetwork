/* Prepare editable community settings from a member's description; never save automatically. */
(()=>{"use strict";
function init(){
 const idea=document.getElementById("communityIdea"),button=document.getElementById("communityDraft"),status=document.getElementById("communityDraftStatus");
 const name=document.getElementById("name"),description=document.getElementById("description"),category=document.getElementById("category");
 if(!idea||!button||!name||!description)return;
 button.addEventListener("click",()=>{
  const text=idea.value.trim();
  if(!text){status.textContent="Describe the community you want to create.";idea.focus();return}
  const first=text.split(/[.!?\n]/).map(s=>s.trim()).find(Boolean)||text;
  if(!name.value.trim())name.value=first.slice(0,120);
  if(!description.value.trim())description.value=text.slice(0,3000);
  const options=[...category.options];
  const match=options.find(option=>option.value!=="community"&&text.toLowerCase().includes(option.value.toLowerCase()));
  if(match)category.value=match.value;
  try{window.SHANEConversation?.remember(text,"community-vision")}catch{}
  status.textContent="Your community draft is ready. Review the name, membership, conversations and other settings before creating it.";
  document.getElementById("form")?.scrollIntoView({behavior:"smooth",block:"start"});
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

/* AI-first enhancement: preserve existing manual drafting as offline fallback. */
(async()=>{
 await import("./shane-conversation-store.js");
 const trigger=document.getElementById("communityDraft"),idea=document.getElementById("communityIdea"),status=document.getElementById("communityDraftStatus");
 if(!trigger||!idea||!status)return;
 trigger.addEventListener("click",async event=>{
  const vision=idea.value.trim();
  if(vision.length<8)return;
  if(!window.SHANEConversationStore?.interpretVision)return;
  event.stopImmediatePropagation();
  trigger.disabled=true;status.textContent="SHANE is interpreting your vision into an editable creation.";
  try{
   const draft=await window.SHANEConversationStore.interpretVision({capability:"community",vision});
   const fields={"name":"name","description":"description","category":"category"};
   for(const [key,id] of Object.entries(fields)){
    const target=document.getElementById(id),value=draft[key];
    if(!target||typeof value!=="string"||!value.trim()||target.value.trim())continue;
    if(target.tagName==="SELECT"){
     const match=[...target.options].find(option=>option.value.toLowerCase()===value.toLowerCase());
     if(match)target.value=match.value;
    }else{target.value=value.slice(0,target.maxLength>0?target.maxLength:4000);target.dispatchEvent(new Event("input",{bubbles:true}));}
   }
   status.textContent="SHANE prepared your creation from the conversation. Review it before saving or publishing.";
  }catch(error){status.textContent="AI drafting unavailable: "+error.message+" Your original draft is preserved."}
  finally{trigger.disabled=false}
 },{capture:true});
})().catch(()=>{});


/* One explicit action saves the interpreted community privately, without a setup wizard. */
(()=>{
 const start=()=>{
 const original=document.getElementById("communityDraft"),status=document.getElementById("communityDraftStatus"),idea=document.getElementById("communityIdea");
 if(!original||!status||!idea)return;
 const create=document.createElement("button");create.type="button";create.textContent="Create my private community";
 original.insertAdjacentElement("afterend",create);
 create.addEventListener("click",async()=>{
  const vision=idea.value.trim();if(vision.length<8){status.textContent="Describe the community you envision first.";return}
  create.disabled=true;status.textContent="SHANE is preparing your private community.";
  try{
   await import("./shane-conversation-store.js");
   const store=window.SHANEConversationStore;
   const draft=await store.interpretVision({capability:"community",vision});
   const name=(document.getElementById("name")?.value||draft.name||"").trim();
   const description=(document.getElementById("description")?.value||draft.description||vision).trim();
   const category=(document.getElementById("category")?.value||draft.category||"community");
   if(!name||!description)throw Error("SHANE needs a community name and description.");
   const result=await store.createPrivateCommunity({vision,name,description,category});
   status.replaceChildren(document.createTextNode("Your private community is saved. "));
   const link=document.createElement("a");link.href="communities.html?organization="+encodeURIComponent(result.organizationId);link.textContent="Open your community";
   status.append(link);
  }catch(error){status.textContent="Community not saved: "+error.message}
  finally{create.disabled=false}
 });
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
