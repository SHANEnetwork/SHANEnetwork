/* Pure compatibility assessment for SHANE compositions. Never claims deployment or certification. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.SHANECompatibility=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const rules={
 messaging:{needs:["memberships"],privacy:"private messaging requires authenticated access and tested authorization"},
 discussions:{needs:["memberships"],privacy:"member discussions require tested membership permissions"},
 memberships:{needs:[],privacy:"member accounts require verified identity and access policies"}
};
function assess(spec,environment={}){
 const modules=Array.isArray(spec?.modules)?spec.modules.map(m=>m?.type).filter(Boolean):[];
 const available=new Set(modules),issues=[],actions=[];
 for(const type of modules){
  const rule=rules[type];if(!rule)continue;
  for(const need of rule.needs)if(!available.has(need)){issues.push({type,kind:"missing_dependency",dependency:need});actions.push({type:"add_dependency",module:need,for:type});}
  if(!environment.verifiedPermissions?.includes(type)){issues.push({type,kind:"verification_required",reason:rule.privacy});actions.push({type:"verify_permissions",module:type});}
 }
 if(environment.clinicalServices===true){
  issues.push({kind:"professional_review_required",reason:"Clinical privacy, provider agreements, licensing and applicable legal requirements require independent verification"});
  actions.push({type:"professional_review",scope:"clinical_services"});
 }
 return {compatible:issues.length===0,issues,actions,certified:false};
}
return Object.freeze({assess});
});
