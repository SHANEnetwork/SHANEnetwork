/* SHANE endeavor plans: account-backed, versioned, no new forms.
   Plans are proposals, never automatic permission to publish or spend. */
(()=>{"use strict";
 const kind="endeavor-plan";
 const valid=id=>typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id);
 const store=()=>window.SHANEConversationStore;
 const capabilities=()=>window.SHANECapabilities;
 async function latest(endeavorId){
  if(!valid(endeavorId))throw Error("Choose an endeavor.");
  if(!store()?.list)throw Error("Conversation storage is not ready.");
  // Page through an active endeavor's records so ordinary conversation does
  // not push its saved plan beyond a fixed 200-entry window.
  for(let offset=0;offset<5000;offset+=200){
   const rows=await store().list({endeavorId,limit:200,offset});
   for(const row of rows){if(row.entry_kind!==kind)continue;
    try{const plan=JSON.parse(row.body);if(plan.version===1&&plan.endeavorId===endeavorId)return {...plan,recordId:row.id,recordedAt:row.created_at}}catch{}
   }
   if(rows.length<200)break;
  }
  return null;
 }
 function draft(vision,endeavorId,previous=null){
  if(!valid(endeavorId))throw Error("Choose an endeavor.");
  const interpretation=capabilities()?.interpret?.(vision);
  if(!interpretation?.vision)throw Error("Describe what you want to create.");
  const old=new Map((previous?.steps||[]).map(step=>[step.capabilityId,step]));
  const steps=interpretation.capabilities.map(item=>{
   const existing=old.get(item.id);
   return {capabilityId:item.id,label:item.label,status:existing?.status||"proposed",
    note:existing?.note||"",requiresConfirmation:true};
  });
  // A conversational refinement may mention only the new part of an endeavor.
  // Keep previously agreed work, including completed and deferred steps, instead
  // of silently deleting it from the active plan.
  const included=new Set(steps.map(item=>item.capabilityId));
  for(const prior of previous?.steps||[]){
   if(!included.has(prior.capabilityId)&&capabilities()?.catalog?.().some(item=>item.id===prior.capabilityId)){
    steps.push({...prior});
    included.add(prior.capabilityId);
   }
  }
  const visionHistory=(previous?.visionHistory||[]).filter(item=>typeof item==="string"&&item.trim()).slice(-19);
  if(previous?.vision&&previous.vision!==interpretation.vision)visionHistory.push(previous.vision);
  return {version:1,endeavorId,vision:interpretation.vision,visionHistory:visionHistory.slice(-20),revision:(previous?.revision||0)+1,
   createdAt:new Date().toISOString(),steps};
 }
 async function save(plan){
  if(!valid(plan?.endeavorId)||plan?.version!==1||!Array.isArray(plan.steps))throw Error("Invalid endeavor plan.");
  const registered=new Set(capabilities()?.catalog?.().map(item=>item.id)||[]);
  if(plan.steps.some(step=>!registered.has(step.capabilityId)||!["proposed","prepared","completed","deferred"].includes(step.status)))throw Error("Plan contains an unknown action or state.");
  const result=await store()?.saveTurn?.(JSON.stringify(plan),{page:"shane-endeavor-plan.js",kind,endeavorId:plan.endeavorId});
  if(!result?.saved)throw Error("Sign in to save the endeavor plan to your account.");
  document.dispatchEvent(new CustomEvent("shane:endeavor-plan-saved",{detail:{endeavorId:plan.endeavorId,revision:plan.revision}}));
  return plan;
 }
 async function create({vision,endeavorId}={}){
  const previous=await latest(endeavorId);
  const proposed=draft(vision,endeavorId,previous);
  if(previous&&previous.vision===proposed.vision&&JSON.stringify(previous.steps)===JSON.stringify(proposed.steps))return previous;
  return save(proposed);
 }
 // A single next-action recommendation, derived from the member's saved plan,
 // is reusable by any page without creating another dashboard or form.
 async function nextAction(endeavorId){
  const plan=await latest(endeavorId);
  if(!plan)return null;
  const step=plan.steps.find(item=>item.status==="prepared")||
   plan.steps.find(item=>item.status==="proposed")||null;
  if(!step)return {endeavorId,revision:plan.revision,done:true,step:null};
  const capability=capabilities()?.catalog?.().find(item=>item.id===step.capabilityId);
  return {endeavorId,revision:plan.revision,done:false,
   step:{...step,path:capability?.path||null},vision:plan.vision};
 }
 async function setStep({endeavorId,capabilityId,status,note=""}={}){
  if(!["proposed","prepared","completed","deferred"].includes(status))throw Error("Invalid status.");
  const previous=await latest(endeavorId);if(!previous)throw Error("Create a plan first.");
  if(!previous.steps.some(step=>step.capabilityId===capabilityId))throw Error("Capability is not part of this plan.");
  const next={...previous,revision:previous.revision+1,createdAt:new Date().toISOString(),steps:previous.steps.map(step=>step.capabilityId===capabilityId?{...step,status,note:String(note).slice(0,1000)}:step)};
  delete next.recordId;delete next.recordedAt;
  return save(next);
 }
 async function history(endeavorId,{limit=20}={}){
  if(!valid(endeavorId))throw Error("Choose an endeavor.");
  const found=[];
  for(let offset=0;offset<5000&&found.length<Math.min(100,Math.max(1,limit));offset+=200){
   const rows=await store().list({endeavorId,limit:200,offset,includeArchived:true});
   for(const row of rows){
    if(row.entry_kind!==kind)continue;
    try{const plan=JSON.parse(row.body);if(plan.version===1&&plan.endeavorId===endeavorId)found.push({...plan,recordId:row.id,recordedAt:row.created_at})}catch{}
    if(found.length>=limit)break;
   }
   if(rows.length<200)break;
  }
  return found;
 }
 async function restore({endeavorId,revision}={}){
  if(!Number.isSafeInteger(revision)||revision<1)throw Error("Invalid plan revision.");
  const revisions=await history(endeavorId,{limit:100});
  const prior=revisions.find(item=>item.revision===revision);
  if(!prior)throw Error("Requested revision was not found.");
  const current=await latest(endeavorId);
  const restored={version:1,endeavorId,vision:prior.vision,visionHistory:[...(current?.visionHistory||[]),current?.vision].filter(Boolean).slice(-20),
   revision:(current?.revision||0)+1,createdAt:new Date().toISOString(),
   restoredFrom:revision,steps:prior.steps.map(step=>({...step}))};
  return save(restored);
 }
 async function prepareStep({endeavorId,capabilityId}={}){
  const plan=await latest(endeavorId);if(!plan)throw Error("Create a plan first.");
  const step=plan.steps.find(item=>item.capabilityId===capabilityId);if(!step)throw Error("Step not in plan.");
  const result=capabilities()?.prepare?.({capabilityId,vision:plan.vision,endeavorId});
  if(!result?.ok)throw Error(result?.reason||"Preparation unavailable.");
  await setStep({endeavorId,capabilityId,status:"prepared"});
  return result;
 }
 // A destination can report that it received a prepared vision. Reflect that
 // handoff in the account-backed endeavor plan, without claiming execution.
 const inFlight=new Set();
 // Script loading is asynchronous on some pages. Keep a bounded, session-only
 // arrival receipt until the account-backed plan service is ready to process it.
 const arrivalKey="shane-pending-plan-arrival-v1";
 function rememberArrival(detail){
  if(!valid(detail?.endeavorId)||typeof detail?.vision!=="string")return;
  try{sessionStorage.setItem(arrivalKey,JSON.stringify({page:detail.page,endeavorId:detail.endeavorId,vision:detail.vision,created:Date.now()}))}catch{}
 }
 async function replayArrival(){
  let pending=null;
  try{pending=JSON.parse(sessionStorage.getItem(arrivalKey)||"null")}catch{}
  if(!pending||!Number.isFinite(pending.created))return;
  if(Date.now()-pending.created<0||Date.now()-pending.created>300000){try{sessionStorage.removeItem(arrivalKey)}catch{}return}
  if(pending.page!==location.pathname.split("/").pop())return;
  await acknowledgeArrival(pending);
 }
 async function acknowledgeArrival(detail){
  const endeavorId=detail?.endeavorId;
  if(!valid(endeavorId)||!store()?.list||!store()?.saveTurn)return;
  if(window.SHANECurrentEndeavor?.read?.()!==endeavorId)return;
  const capability=capabilities()?.catalog?.().find(item=>item.path===detail.page);
  if(!capability)return;
  const key=endeavorId+":"+capability.id;
  if(inFlight.has(key))return;
  inFlight.add(key);
  try{
   const plan=await latest(endeavorId);
   if(!plan||typeof detail?.vision!=="string"||detail.vision.trim()!==plan.vision.trim())return;
   const step=plan.steps.find(item=>item.capabilityId===capability.id);
   if(!step)return;
   if(step.status==="prepared"){try{sessionStorage.removeItem(arrivalKey)}catch{}return}
   if(step.status!=="proposed"){try{sessionStorage.removeItem(arrivalKey)}catch{}return}
   // Merely opening a destination means prepared, never completed.
   await setStep({endeavorId,capabilityId:capability.id,status:"prepared",note:"Vision delivered to "+detail.page});
   try{sessionStorage.removeItem(arrivalKey)}catch{}
  }catch(error){
   document.dispatchEvent(new CustomEvent("shane:endeavor-plan-sync-error",{detail:{page:detail.page,message:String(error?.message||error)}}));
  }finally{inFlight.delete(key)}
 }
 document.addEventListener("shane:endeavor-arrived",event=>{
  rememberArrival(event.detail);
  void acknowledgeArrival(event.detail);
 });
 document.addEventListener("shane:conversation-store-ready",()=>{void replayArrival()});
 document.addEventListener("shane:endeavor-plan-ready",()=>{void replayArrival()});
 void replayArrival();
 window.SHANEEndeavorPlan=Object.freeze({latest,history,restore,draft,create,setStep,prepareStep,nextAction});
 document.dispatchEvent(new Event("shane:endeavor-plan-ready"));
})();
