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
function preflight(spec,context={}){
 const technical=assess(spec,context);
 const unknowns=[],paths=[];
 const jurisdiction=typeof context.jurisdiction==="string"?context.jurisdiction.trim():"";
 const activity=typeof context.activity==="string"?context.activity.trim():"";
 if(!jurisdiction)unknowns.push({kind:"jurisdiction",question:"Where will the service operate and where will its users be located?"});
 if(!activity)unknowns.push({kind:"actual_services",question:"What activities will the service actually provide?"});
 if(context.clinicalServices===true){
  unknowns.push({kind:"licensing",question:"Which professionals will provide regulated services, and where are they licensed?"});
  unknowns.push({kind:"privacy",question:"Which records and communications contain protected client information?"});
  paths.push({kind:"alternative_model",description:"Explore a genuinely nonclinical education or peer-support model if it fulfills the creator's goals; verify activities and advertising, not just labels.",verified:false});
 }
 const status=technical.issues.length||unknowns.length?"needs_verification":"technical_checks_clear";
 return {status,technical,unknowns,paths,legalDetermination:false,certified:false};
}
function riskPlan(spec,context={}){
 const preliminary=preflight(spec,context),unknowns=[...preliminary.unknowns];
 const money=Number.isFinite(context.availableBudget)&&context.availableBudget>=0?context.availableBudget:null;
 const spend=Number.isFinite(context.plannedCommitment)&&context.plannedCommitment>=0?context.plannedCommitment:null;
 const runway=Number.isFinite(context.monthlyEssentialCosts)&&context.monthlyEssentialCosts>0&&money!==null?money/context.monthlyEssentialCosts:null;
 if(money===null)unknowns.push({kind:"budget",question:"What resources can be risked without threatening essential living needs?"});
 if(spend===null)unknowns.push({kind:"commitment",question:"What nonrecoverable costs would launching require?"});
 if(runway===null)unknowns.push({kind:"runway",question:"How long can essential expenses be covered independently of this endeavor?"});
 const warnings=[];
 if(money!==null&&spend!==null&&spend>money)warnings.push({kind:"unfunded_commitment",reason:"Planned spending exceeds available budget"});
 if(runway!==null&&runway<3)warnings.push({kind:"limited_runway",reason:"Fewer than three months of essential expenses are covered; this is a caution threshold, not a success prediction"});
 const gates=[
  {id:"evidence",question:"What real-world evidence demonstrates demand or need?",verified:false},
  {id:"feasibility",question:"Which critical legal, technical, and operational dependencies have been verified?",verified:false},
  {id:"small_trial",question:"What is the cheapest reversible experiment that tests the central assumption?",verified:false},
  {id:"fallback",question:"What alternative or stopping plan protects essential resources if the first approach fails?",verified:false}
 ];
 return {status:warnings.length?"high_caution":unknowns.length||preliminary.technical.issues.length?"insufficient_evidence":"ready_for_independent_review",warnings,unknowns,gates,technical:preliminary.technical,paths:preliminary.paths,estimatedRunwayMonths:runway,successProbability:null,certified:false};
}
function comparePaths(paths=[]){
 if(!Array.isArray(paths))throw Error("Paths must be an array");
 return paths.map((path,index)=>{
  const cost=Number.isFinite(path?.cost)&&path.cost>=0?path.cost:null;
  const duration=Number.isFinite(path?.months)&&path.months>=0?path.months:null;
  const evidence=path?.evidence==="verified"?"verified":path?.evidence==="partial"?"partial":"unknown";
  const risks=Array.isArray(path?.risks)?path.risks.filter(x=>typeof x==="string"):[];
  return {id:String(path?.id||index+1),name:String(path?.name||"Alternative "+(index+1)),cost,months:duration,evidence,risks,assumptions:Array.isArray(path?.assumptions)?path.assumptions.filter(x=>typeof x==="string"):[],successProbability:null};
 }).sort((a,b)=>(a.cost??Infinity)-(b.cost??Infinity));
}
return Object.freeze({assess,preflight,riskPlan,comparePaths});
});
