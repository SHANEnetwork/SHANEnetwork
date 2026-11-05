/* Endeavor-centered dashboard continuity. A session ID is never proof of ownership. */
(()=>{"use strict";
const valid=id=>typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id);
const isActiveEndeavor=id=>{try{return JSON.parse(sessionStorage.getItem("shane-active-endeavor-v1")||"null")?.id===id}catch{return false}};
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
  const {data:item,error}=await sb.from("shane_endeavors").select("id,title,idea,linked_site_id").eq("id",id).eq("owner_id",user.id).maybeSingle();
  if(error)throw error;
  if(!item){status.textContent="This endeavor is not available to your account. Choose another from My Endeavors.";return}
  sessionStorage.setItem("shane-active-endeavor-v1",JSON.stringify({id:item.id,updated:Date.now()}));
  document.dispatchEvent(new CustomEvent("shane:active-endeavor-changed",{detail:{id:item.id}}));
  status.textContent="Continuing: "+(item.title||"Untitled endeavor")+". Your work remains private until you choose otherwise.";
  // Conversation remains the primary way to develop the endeavor. Reasoning is saved, not executed without approval.
  const conversation=document.createElement("section");conversation.id="shane-endeavor-conversation";conversation.style.cssText="margin:20px 0;padding:22px;border:1px solid #dec6c0;border-radius:20px;background:#fffaf3";
  const conversationTitle=document.createElement("h3");conversationTitle.textContent="Continue developing "+(item.title||"this endeavor")+" with SHANE";
  const conversationNote=document.createElement("p");conversationNote.textContent="Discuss the endeavor's direction, decisions, problems, and next creations. SHANE examines alternatives and saves its reasoning to this endeavor's history. Nothing is published or executed automatically.";
  const conversationForm=document.createElement("form");conversationForm.style.cssText="display:grid;gap:12px";
  const conversationInput=document.createElement("textarea");conversationInput.rows=4;conversationInput.required=true;conversationInput.minLength=8;conversationInput.maxLength=12000;conversationInput.placeholder="What should we develop, reconsider, or accomplish next for this endeavor?";conversationInput.style.cssText="width:100%;box-sizing:border-box;padding:12px;border-radius:12px";
  const think=document.createElement("button");think.type="submit";think.textContent="Develop this endeavor with SHANE";
  const conversationStatus=document.createElement("p");conversationStatus.setAttribute("role","status");
  const conversationAnswer=document.createElement("div");conversationAnswer.setAttribute("aria-live","polite");conversationAnswer.style.whiteSpace="pre-wrap";
  conversationForm.append(conversationInput,think,conversationStatus);conversation.append(conversationTitle,conversationNote,conversationForm,conversationAnswer);host.append(conversation);
  conversationForm.addEventListener("submit",async event=>{
   event.preventDefault();if(!conversationInput.reportValidity())return;
   think.disabled=true;conversationStatus.textContent="Developing this endeavor and comparing possible paths…";
   try{
    if(!window.SHANEConversationStore?.reasonAndCreate)await import("./shane-conversation-store.js");
    const result=await window.SHANEConversationStore.reasonAndCreate({endeavorId:item.id,request:conversationInput.value.trim()});
    conversationAnswer.textContent=String(result.response||"No response returned.");
    conversationStatus.textContent=result.selectionProvisional?"Reasoning saved to this endeavor. The comparison is provisional; no action was executed.":"Reasoning saved to this endeavor. No action was executed.";
    if(result.creationPlan){
     const plan=result.creationPlan;
     const steps=Array.isArray(plan)?plan:Array.isArray(plan.steps)?plan.steps:[];
     const review=document.createElement("section");review.style.cssText="padding:14px;margin-top:16px;border:1px solid #dec6c0;border-radius:14px";
     const heading=document.createElement("h4");heading.textContent="Review SHANE's proposed endeavor creations";review.append(heading);
     if(!steps.length){const note=document.createElement("p");note.textContent="SHANE proposed a plan but did not provide reviewable creation steps. No action was taken.";review.append(note)}
     else{
      const list=document.createElement("ol");
      for(const step of steps){const entry=document.createElement("li");entry.textContent=(step.type||"Unspecified creation")+": "+String(step.vision||"").slice(0,800);list.append(entry)}
      review.append(list);
      const preview=window.SHANEConversationStore.evaluateCreationPlan({steps});
      const validation=document.createElement("p");validation.textContent=preview.ready?"These steps are ready to save as a private endeavor plan. Saving does not create or publish them.":"This proposal needs more information before it can be saved: "+(preview.reason||"Incomplete steps");review.append(validation);
      const save=document.createElement("button");save.type="button";save.textContent="Save reviewed plan to this endeavor";save.disabled=!preview.ready;
      const saveStatus=document.createElement("p");saveStatus.setAttribute("role","status");review.append(save,saveStatus);
      save.addEventListener("click",async()=>{
       save.disabled=true;saveStatus.textContent="Saving the reviewed plan to this endeavor…";
       try{const result=await window.SHANEConversationStore.saveCreationPlan({endeavorId:item.id,steps});if(!result.saved)throw Error("Plan save not confirmed.");saveStatus.textContent="Plan saved to this endeavor. No creations were executed.";document.dispatchEvent(new CustomEvent("shane:endeavor-reasoning-saved",{detail:{endeavorId:item.id}}))}
       catch(error){saveStatus.textContent="Could not save plan: "+String(error?.message||error);save.disabled=false}
      });
     }
     conversationAnswer.append(review);
    }
    document.dispatchEvent(new CustomEvent("shane:endeavor-reasoning-saved",{detail:{endeavorId:item.id}}));
   }catch(error){conversationStatus.textContent="Could not confirm the reasoning was saved: "+String(error?.message||error)+". Your request remains available."}
   finally{think.disabled=false}
  });
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
  for(const [value,label] of [["listing","Network opportunity or collaboration listing"],["community","Community or association"],["campaign","Event or campaign"],...(item.linked_site_id?[]:[["new-website","Website for this endeavor"]])]){const option=document.createElement("option");option.value=value;option.textContent=label;choice.append(option)}
  if(item.linked_site_id){const option=document.createElement("option");option.value="website";option.textContent="Revise this endeavor\u0027s primary website";choice.append(option)}
  const request=document.createElement("textarea");request.rows=4;request.maxLength=12000;request.required=true;request.minLength=8;request.placeholder="Describe the outcome you want, the people it serves, and what should be created…";request.style.cssText="width:100%;box-sizing:border-box;padding:12px;border-radius:12px";
  const deadline=document.createElement("input");deadline.type="datetime-local";deadline.setAttribute("aria-label","Interest deadline for event or campaign");deadline.hidden=true;
  choice.addEventListener("change",()=>{deadline.hidden=choice.value!=="campaign";deadline.required=choice.value==="campaign"});
  const create=document.createElement("button");create.type="submit";create.textContent="Create and save private draft";
  const outcome=document.createElement("p");outcome.setAttribute("role","status");
  form.append(choice,request,deadline,create,outcome);studio.append(heading,explanation,form);host.append(studio);
  // Show actual account-authorized collaboration records, not guessed matches.
  const collaboration=document.createElement("section");collaboration.id="shane-endeavor-collaboration";collaboration.style.cssText="margin-top:18px;padding:20px;border:1px solid #dec6c0;border-radius:18px;background:#fffaf3";
  const collabTitle=document.createElement("h3");collabTitle.textContent="People and opportunities connected to this endeavor";
  const collabStatus=document.createElement("p");collabStatus.setAttribute("role","status");
  const collabList=document.createElement("div");
  const collabRefresh=document.createElement("button");collabRefresh.type="button";collabRefresh.textContent="Refresh connections";
  collaboration.append(collabTitle,collabStatus,collabList,collabRefresh);host.append(collaboration);
  async function refreshConnections(){
   collabRefresh.disabled=true;collabStatus.textContent="Checking saved opportunities and accepted collaborations…";collabList.replaceChildren();
   try{
    if(!window.SHANEConversationStore?.collaborationContext)await import("./shane-conversation-store.js");
    const context=await window.SHANEConversationStore.collaborationContext({endeavorId:item.id,limit:20});
    if(context.endeavorId!==item.id||!context.confirmed)throw Error("Could not verify the endeavor's connections.");
    collabStatus.textContent=context.listings.length+" saved Network listing(s), "+context.collaborations.length+" accepted collaboration(s).";
    for(const listing of context.listings){const p=document.createElement("p");p.textContent="Opportunity: "+listing.title+" ";const link=document.createElement("a");link.href="members.html?listing="+encodeURIComponent(listing.id)+"&endeavor="+encodeURIComponent(item.id);link.textContent="Review listing";p.append(link);collabList.append(p)}
    for(const connection of context.collaborations){const p=document.createElement("p");p.textContent="Accepted collaboration for "+connection.listingTitle+" ";const link=document.createElement("a");link.href=connection.url;link.textContent="Coordinate together";p.append(link);collabList.append(p)}
    if(!context.listings.length){const p=document.createElement("p");p.textContent="No Network listings are attached yet. Create a private opportunity above to begin.";collabList.append(p)}
   }catch(error){collabStatus.textContent="Could not load verified connections: "+String(error?.message||error)}
   finally{collabRefresh.disabled=false}
  }
  collabRefresh.addEventListener("click",()=>void refreshConnections());
  document.addEventListener("shane:endeavor-creation-saved",event=>{if(event.detail?.endeavorId===item.id)void refreshConnections()});
  void refreshConnections();
  // A single read-only account-backed view of this endeavor's evolution.
  const timeline=document.createElement("section");timeline.id="shane-endeavor-evolution";timeline.style.cssText="margin-top:18px;padding:20px;border:1px solid #dec6c0;border-radius:18px;background:#fffaf3";
  const evolutionTitle=document.createElement("h3");evolutionTitle.textContent="Your endeavor's continuing story";
  const evolutionStatus=document.createElement("p");evolutionStatus.setAttribute("role","status");
  const evolutionContent=document.createElement("div");
  const evolutionRefresh=document.createElement("button");evolutionRefresh.type="button";evolutionRefresh.textContent="Refresh endeavor history";
  timeline.append(evolutionTitle,evolutionStatus,evolutionContent,evolutionRefresh);host.append(timeline);
  function section(label,items,render){
   const wrap=document.createElement("section"),heading=document.createElement("h4");heading.textContent=label;wrap.append(heading);
   if(!items.length){const empty=document.createElement("p");empty.textContent="Nothing recorded here yet.";wrap.append(empty)}
   for(const entry of items){const row=document.createElement("p");render(row,entry);wrap.append(row)}
   evolutionContent.append(wrap);
  }
  async function refreshEvolution(){
   evolutionRefresh.disabled=true;evolutionStatus.textContent="Reading this endeavor's saved creations, decisions and ongoing work…";evolutionContent.replaceChildren();
   try{
    if(!window.SHANEConversationStore?.endeavorSnapshot)await import("./shane-conversation-store.js");
    const snapshot=await window.SHANEConversationStore.endeavorSnapshot({endeavorId:item.id});
    if(snapshot.endeavor?.id!==item.id)throw Error("The returned history does not match this endeavor.");
    const available=snapshot.availability||{};
    evolutionStatus.textContent="Saved endeavor: "+(snapshot.endeavor.title||"Untitled")+". This view includes only records SHANE could verify.";
    if(!available.creations||!available.history||!available.collaborations){const note=document.createElement("p");note.textContent="Some history sources are temporarily unavailable; the view may be incomplete.";evolutionContent.append(note)}
    section("Creations belonging to this endeavor",snapshot.creations||[],(row,creation)=>{
     row.append(document.createTextNode((creation.type||"Creation")+": "+(creation.title||"Untitled")+" "));
     if(creation.url){const link=document.createElement("a");link.href=creation.url;link.textContent="Open";row.append(link)}
    });
    section("Accepted collaborators",snapshot.collaborations||[],(row,connection)=>{
     row.append(document.createTextNode(connection.listingTitle||"Collaboration"));
     if(connection.url){const link=document.createElement("a");link.href=connection.url;link.textContent=" Coordinate";row.append(link)}
    });
    const plan=snapshot.creationPlan;
    if(plan){const p=document.createElement("p");p.textContent="Saved creation plan: "+plan.completed.length+" completed step(s), "+(plan.remaining===null?"unknown":plan.remaining)+" remaining.";evolutionContent.append(p);
     const steps=document.createElement("p");steps.textContent="Creation sequence: "+plan.types.join(", ")+(plan.nextStep?". Next: "+plan.nextStep:"");evolutionContent.append(steps);
     for(const receipt of plan.completed){const line=document.createElement("p");line.textContent="Confirmed creation: "+receipt.type+" ";if(receipt.url){const link=document.createElement("a");link.href=receipt.url;link.textContent="Open";line.append(link)}evolutionContent.append(line)}
    }
    if(plan&&plan.remaining>0){
     const review=document.createElement("section");review.style.cssText="margin-top:12px;padding:14px;border:1px solid #dec6c0;border-radius:14px";
     const heading=document.createElement("h4");heading.textContent="Review the endeavor's unfinished work";review.append(heading);
     const details=document.createElement("ol"),note=document.createElement("p"),approve=document.createElement("button");approve.type="button";approve.textContent="Approve remaining private creations";approve.disabled=true;
     review.append(details,note,approve);evolutionContent.append(review);
     try{
      const store=window.SHANEConversationStore;
      const saved=await store.loadCreationPlan({endeavorId:item.id});
      if(!saved?.steps?.length)throw Error("The saved plan has no steps.");
      if(saved.endeavorId!==item.id)throw Error("The saved plan belongs to another endeavor.");
      const check=store.evaluateCreationPlan({steps:saved.steps});
      saved.steps.forEach((step,index)=>{const li=document.createElement("li");li.textContent=(index<plan.completed.length?"Completed: ":"Pending: ")+(step.type||"Creation")+" | "+String(step.vision||"").slice(0,500);details.append(li)});
      if(!check.ready)note.textContent="The plan needs revision: "+(check.reason||"Incomplete creation details");
      else if(!isActiveEndeavor(item.id))note.textContent="Creation is paused until the active-endeavor confirmation is available. Your plan remains saved.";
      else{
       note.textContent="Only private drafts will be created. Nothing will be published or invitations sent.";approve.disabled=false;
       approve.addEventListener("click",async()=>{
        approve.disabled=true;note.textContent="Checking prior receipts and creating approved drafts…";
        try{const result=await store.executeApprovedSequence({endeavorId:item.id,steps:saved.steps,approved:true});note.textContent=result.complete&&result.verified?"All steps completed and verified.":"Some steps remain unfinished. Confirmed progress is retained.";await refreshConnections();await refreshEvolution()}
        catch(error){note.textContent="Execution stopped: "+String(error?.message||error)+". Review the saved progress before trying again.";approve.disabled=false}
       });
      }
     }catch(error){note.textContent="Unable to inspect the saved plan: "+String(error?.message||error)}
    }
    if(snapshot.planError){const p=document.createElement("p");p.textContent="Saved plan unavailable: "+snapshot.planError;evolutionContent.append(p)}
    section("Recent conversation and creation history",snapshot.recentHistory||[],(row,entry)=>{
     const time=entry.at?new Date(entry.at):null;
     let message=entry.text||"";
     if(["reasoning-cycle","creation-plan","creation-outcome"].includes(entry.kind)){
      try{const data=JSON.parse(message);
       if(entry.kind==="reasoning-cycle")message="Request: "+String(data.request||"").slice(0,260)+" | SHANE: "+String(data.selectedResponse||data.response||"Analysis saved").slice(0,440);
       else if(entry.kind==="creation-plan")message="Reviewed plan: "+(Array.isArray(data.steps)?data.steps.map(step=>step.type).join(", "):"Saved steps");
       else message="Creation outcome: "+(data.complete?"complete":"in progress")+", "+(Array.isArray(data.receipts)?data.receipts.length:0)+" confirmed receipts";
      }catch{message="Saved "+entry.kind+" record"}
     }
     row.textContent=(time&&!Number.isNaN(time.getTime())?time.toLocaleDateString()+" · ":"")+(entry.kind||"Update")+": "+message;
    });
   }catch(error){evolutionStatus.textContent="Unable to load this endeavor's history: "+String(error?.message||error)}
   finally{evolutionRefresh.disabled=false}
  }
  evolutionRefresh.addEventListener("click",()=>void refreshEvolution());
  document.addEventListener("shane:endeavor-reasoning-saved",event=>{if(event.detail?.endeavorId===item.id)void refreshEvolution()});
  document.addEventListener("shane:endeavor-creation-saved",event=>{if(event.detail?.endeavorId===item.id)void refreshEvolution()});
  void refreshEvolution();

  form.addEventListener("submit",async event=>{
   event.preventDefault();if(!request.reportValidity()||!deadline.reportValidity())return;
   create.disabled=true;outcome.textContent="Creating and saving for "+(item.title||"this endeavor")+"…";
   try{
    if(!window.SHANEConversationStore?.executeVision)await import("./shane-conversation-store.js");
    const store=window.SHANEConversationStore;if(!store?.executeVision)throw Error("Creation engine unavailable.");
    const result=await store.executeVision({type:choice.value,vision:request.value.trim(),endeavorId:item.id,siteId:choice.value==="website"?item.linked_site_id:undefined,deadline:choice.value==="campaign"?deadline.value:undefined});
    outcome.textContent=choice.value==="website"?"Your endeavor website revision was saved. Publication status was not changed here.":"Saved privately for your endeavor. Nothing was published.";
    if(result.endeavorLink?.reason)outcome.textContent=result.endeavorLink.reason;
    if(result.url){const link=document.createElement("a");link.href=result.url;link.textContent="Open saved creation";outcome.append(" ",link)}
    document.dispatchEvent(new CustomEvent("shane:endeavor-creation-saved",{detail:{endeavorId:item.id,type:choice.value,artifactId:result.id,changeKind:result.receipt?.changeKind||"creation"}}));
   }catch(error){outcome.textContent="Creation was not confirmed: "+String(error?.message||error)+". Your description remains available."}
   finally{create.disabled=false}
  });

 }catch(error){status.textContent="Unable to verify your endeavor right now. No changes were made.";console.warn("SHANE endeavor continuity:",error)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>void init(),{once:true});else void init();
})();
