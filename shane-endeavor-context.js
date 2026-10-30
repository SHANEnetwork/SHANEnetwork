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
 function build(endeavor,role="creator",specialty=""){
  if(!endeavor?.id||!endeavor.persisted)throw Error("A saved endeavor is required.");
  if(!Object.prototype.hasOwnProperty.call(roles,role))throw Error("Unknown role.");
  return Object.freeze({
   endeavorId:endeavor.id,role,mandate:roles[role],specialty:trim(specialty,120),
   title:trim(endeavor.title,150),vision:trim(endeavor.vision),
   linkedSiteId:endeavor.linkedSiteId||null,
   linkedOrganizationId:endeavor.linkedOrganizationId||null,
   composition:endeavor.spec||null,
   conversation:Array.isArray(endeavor.conversation)?endeavor.conversation.map(t=>({role:trim(t.role,40),text:trim(t.text,6000)})):[],
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
  if(!Object.prototype.hasOwnProperty.call(roles,role))throw Error("Unknown role.");
  return Object.freeze({...context,role,mandate:roles[role],specialty:trim(specialty,120),request:trim(request,4000),advisoryOnly:true,legalExecutionAuthorized:false});
 }
 return Object.freeze({roles,build,load,handoff});
});