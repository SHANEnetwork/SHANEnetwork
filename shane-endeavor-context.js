(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.SHANEEndeavorContext=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const roles=Object.freeze({
  creator:"Design and refine the endeavor while preserving its owner's work.",
  analyst:"Independently evaluate feasibility, evidence, costs, risks and alternatives.",
  professional:"Apply the selected specialty and distinguish evidence from assumptions.",
  legal:"Prepare agreement drafts and identify terms needing legal review without executing agreements.",
  gamemaster:"Support consensual fictional adventures and preserve story continuity."
 });
 const trim=(value,max=8000)=>String(value||"").trim().slice(0,max);
 // Snapshot nested project data so later edits cannot silently change an AI review in progress.
 const snapshot=value=>{
  if(value == null)return null;
  const seen=new WeakSet();
  const sanitize=(item,depth=0)=>{
   if(depth>24)throw Error("Endeavor context exceeds nesting limit.");
   if(item===null||typeof item==="string"||typeof item==="boolean")return item;
   if(typeof item==="number")return Number.isFinite(item)?item:null;
   if(typeof item!=="object")return null;
   if(seen.has(item))throw Error("Circular endeavor context.");
   seen.add(item);
   const out=Array.isArray(item)?item.map(v=>sanitize(v,depth+1)):Object.fromEntries(Object.keys(item).filter(k=>!["__proto__","constructor","prototype"].includes(k)).map(k=>[k,sanitize(item[k],depth+1)]));
   seen.delete(item);return out;
  };
  return sanitize(value);
 };
 const freezeDeep=value=>{if(value && typeof value==="object" && !Object.isFrozen(value)){Object.values(value).forEach(freezeDeep);Object.freeze(value);}return value;};
 function build(endeavor,role="creator",specialty=""){
  if(!endeavor?.id||!endeavor.persisted)throw Error("A saved endeavor is required.");
  if(!Object.prototype.hasOwnProperty.call(roles,role))throw Error("Unknown role.");
  return freezeDeep({
   endeavorId:endeavor.id,role,mandate:roles[role],specialty:trim(specialty,120),
   accessRole:endeavor.accessRole==="collaborator"?"collaborator":"owner",canEdit:endeavor.accessRole!=="collaborator"&&endeavor.canEdit!==false,
   title:trim(endeavor.title,150),vision:trim(endeavor.vision),
   linkedSiteId:endeavor.linkedSiteId||null,
   linkedOrganizationId:endeavor.linkedOrganizationId||null,
   composition:snapshot(endeavor.spec),
   conversation:Array.isArray(endeavor.conversation)?endeavor.conversation.map(t=>({role:trim(t?.role,40),text:trim(t?.text,6000)})):[],
   advisoryOnly:true,
   legalExecutionAuthorized:false
  });
 }
 async function load(client,id,store,role="creator",specialty=""){
  if(!store?.load)throw Error("Authenticated endeavor store required.");
  return build(await store.load(client,id),role,specialty);
 }
 function handoff(context,role,request="",specialty=""){
  if(!context?.endeavorId)throw Error("Invalid context.");
  // Handoffs may only preserve or reduce authority, never manufacture ownership.
  if(context.accessRole==="collaborator"||context.canEdit===false){
    context={...context,accessRole:"collaborator",canEdit:false};
  }
  if(!Object.prototype.hasOwnProperty.call(roles,role))throw Error("Unknown role.");
  return freezeDeep({...context,role,mandate:roles[role],specialty:trim(specialty,120),request:trim(request,4000),advisoryOnly:true,legalExecutionAuthorized:false});
 }
 return Object.freeze({roles,build,load,handoff});
});