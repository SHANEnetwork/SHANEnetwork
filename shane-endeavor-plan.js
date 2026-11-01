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
  const rows=await store().list({endeavorId,limit:200});
  for(const row of rows){if(row.entry_kind!==kind)continue;
   try{const plan=JSON.parse(row.body);if(plan.version===1&&plan.endeavorId===endeavorId)return {...plan,recordId:row.id,recordedAt:row.created_at}}catch{}
  }
  return null;
 }
 function draft(vision,endeavorId,previous=null){
  if(!valid(endeavorId))throw Error("Choose an endeavor.");
  const interpretation=capabilities()?.interpret?.(vision);
  if(!interpretation?.vision)throw Error("Describe what you want to create.");
  const old=new Map((previous?.steps||[]).map(step=>[step.capabilityId,step]));
  return {version:1,endeavorId,vision:interpretation.vision,revision:(previous?.revision||0)+1,
   createdAt:new Date().toISOString(),steps:interpretation.capabilities.map(item=>{
    const existing=old.get(item.id);
    return {capabilityId:item.id,label:item.label,status:existing?.status||"proposed",
     note:existing?.note||"",requiresConfirmation:true};
   })};
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
  return save(draft(vision,endeavorId,previous));
 }
 async function setStep({endeavorId,capabilityId,status,note=""}={}){
  if(!["proposed","prepared","completed","deferred"].includes(status))throw Error("Invalid status.");
  const previous=await latest(endeavorId);if(!previous)throw Error("Create a plan first.");
  if(!previous.steps.some(step=>step.capabilityId===capabilityId))throw Error("Capability is not part of this plan.");
  const next={...previous,revision:previous.revision+1,createdAt:new Date().toISOString(),steps:previous.steps.map(step=>step.capabilityId===capabilityId?{...step,status,note:String(note).slice(0,1000)}:step)};
  delete next.recordId;delete next.recordedAt;
  return save(next);
 }
 async function prepareStep({endeavorId,capabilityId}={}){
  const plan=await latest(endeavorId);if(!plan)throw Error("Create a plan first.");
  const step=plan.steps.find(item=>item.capabilityId===capabilityId);if(!step)throw Error("Step not in plan.");
  const result=capabilities()?.prepare?.({capabilityId,vision:plan.vision,endeavorId});
  if(!result?.ok)throw Error(result?.reason||"Preparation unavailable.");
  await setStep({endeavorId,capabilityId,status:"prepared"});
  return result;
 }
 window.SHANEEndeavorPlan=Object.freeze({latest,draft,create,setStep,prepareStep});
})();
