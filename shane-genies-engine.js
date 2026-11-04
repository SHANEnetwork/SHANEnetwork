/* SHANE Genies: additive, deterministic endeavor reasoning contract.
   Does not claim to replace an LLM or automatically deploy a site.
   Keeps El-style fast conversation independent. No network calls. */
(function(root){"use strict";
const RULES=Object.freeze({
 optimizer:["never-degrade","simplicity-first","elegance","alignment","fractal-scaling","non-entropic","positive-flip","grandfather-clause"],
 harmonizer:["no-unnecessary-tradeoffs","double-harmonizer","consent","spiral-flow","balance","sovereignty","evolutionary-push","mirror-truth"],
 compasses:["truth-and-evidence","hidden-assumptions-and-constraints","overlaps-and-regressions","unify-and-recheck","unconsidered-possibilities"]
});
const clean=x=>typeof x==="string"?x.trim().slice(0,3000):"";
const unique=xs=>[...new Set(xs.map(clean).filter(Boolean))];
function normalize(input){
 const v=input&&typeof input==="object"?input:{};
 return {vision:clean(v.vision),requirements:unique(Array.isArray(v.requirements)?v.requirements:[]),
  strengths:unique(Array.isArray(v.strengths)?v.strengths:[]),
  constraints:unique(Array.isArray(v.constraints)?v.constraints:[]),
  negatives:unique(Array.isArray(v.negatives)?v.negatives:[]),
  candidates:(Array.isArray(v.candidates)?v.candidates:[]).slice(0,20).map((c,i)=>({
   id:clean(c?.id)||"candidate-"+(i+1),name:clean(c?.name)||"Alternative "+(i+1),
   strengths:unique(Array.isArray(c?.strengths)?c.strengths:[]),
   weaknesses:unique(Array.isArray(c?.weaknesses)?c.weaknesses:[]),
   requirementsMet:unique(Array.isArray(c?.requirementsMet)?c.requirementsMet:[]),
   evidence:unique(Array.isArray(c?.evidence)?c.evidence:[])
  }))};
}
function ponderer(v){
 return [
  {id:"direct",name:"Direct creation",approach:"Create the requested endeavor while preserving existing capabilities."},
  {id:"collaborative",name:"Network collaboration",approach:"Seek complementary collaborators, resources and shared opportunities."},
  {id:"inverted",name:"Constraint inversion",approach:"Reframe a limiting requirement and investigate whether the need can be eliminated."}
 ];
}
function flipper(negative){
 return {negative,question:"How could we remove, bypass, or turn this limitation into an advantage without losing required strengths?",
  proposals:["Eliminate the underlying need","Share or reuse a resource","Change sequence, location, or delivery model"],
  status:"hypothesis-not-verified"};
}
function compasses(v,candidate){
 const issues=[];
 for(const req of v.requirements)if(!candidate.requirementsMet.includes(req))issues.push({compass:3,type:"unverified-requirement",detail:req});
 for(const s of v.strengths)if(!candidate.strengths.includes(s))issues.push({compass:3,type:"preservation-not-demonstrated",detail:s});
 for(const w of candidate.weaknesses)issues.push({compass:2,type:"known-weakness",detail:w});
 if(!candidate.evidence.length)issues.push({compass:1,type:"evidence-missing",detail:"Candidate claims have no supplied evidence."});
 return issues;
}
function harmonize(v,a,b){
 const strengths=unique([...a.strengths,...b.strengths,...v.strengths]);
 const requirementsMet=a.requirementsMet.filter(x=>b.requirementsMet.includes(x));
 const combined={id:"combined-"+a.id+"-"+b.id,name:"Combined exploration: "+a.name+" + "+b.name,
  strengths,requirementsMet,weaknesses:unique([...a.weaknesses,...b.weaknesses]),
  evidence:[],provisional:true};
 return {candidate:combined,notes:["Combination is a hypothesis, not proof of compatibility.","Requirements only count as met if both inputs claim them; revalidate in the real endeavor.","Preserved strengths are design goals until demonstrated."],findings:compasses(v,combined)};
}
function fifthCompass(v,findings){
 return {purpose:"Search for possibilities missed by the first four compasses",
  questions:unique(["What shared assumption constrains every proposed alternative?",
  "What entirely different endeavor model could satisfy the original vision?",
  "What would change if the most limiting constraint disappeared?",
  ...findings.filter(x=>x.type==="unverified-requirement").map(x=>"What new approach could satisfy: "+x.detail+"?")])};
}
/* Rules are established before candidate examination. A candidate's self-reported
   claims are not evidence: scoring tracks coverage and outstanding verification.
   No random sampling or fictional Monte Carlo statistics are reported. */
function evolve(input,options={}){
 const v=normalize(input);
 const maxRounds=Math.max(1,Math.min(5,Number.isInteger(options.rounds)?options.rounds:3));
 const maxCandidates=Math.max(2,Math.min(20,Number.isInteger(options.maxCandidates)?options.maxCandidates:12));
 const ledger=[],seen=new Set();
 let population=v.candidates.slice(0,maxCandidates).map(c=>({...c,provisional:false,origin:"supplied"}));
 const signature=c=>[...c.strengths].sort().join("|")+"::"+[...c.requirementsMet].sort().join("|")+"::"+[...c.weaknesses].sort().join("|");
 const assess=c=>{
  const findings=compasses(v,c);
  const verified=!!c.evidence.length && !c.provisional;
  const coverage=v.requirements.length?c.requirementsMet.filter(x=>v.requirements.includes(x)).length/v.requirements.length:0;
  const preservation=v.strengths.length?v.strengths.filter(x=>c.strengths.includes(x)).length/v.strengths.length:0;
  const risks=c.weaknesses.length+findings.length;
  return {candidate:c,coverage,preservation,risks,findings,verified,
   status:verified?"evidence-supplied-needs-independent-validation":"hypothesis-not-verified"};
 };
 for(let round=1;round<=maxRounds&&population.length;round++){
  const ranked=population.map(assess).sort((a,b)=>
   b.coverage-a.coverage||b.preservation-a.preservation||a.risks-b.risks||
   a.candidate.id.localeCompare(b.candidate.id));
  const best=ranked[0];
  ledger.push({round,considered:ranked.length,leader:best.candidate.id,
   reviews:ranked.map(x=>({id:x.candidate.id,coverage:x.coverage,preservation:x.preservation,
    risks:x.risks,status:x.status,findings:x.findings})),
   fifthCompass:fifthCompass(v,ranked.flatMap(x=>x.findings))});
  if(round===maxRounds||ranked.length<2)break;
  const parents=ranked.slice(0,Math.min(4,ranked.length));
  const offspring=[];
  for(let i=0;i<parents.length;i++)for(let j=i+1;j<parents.length;j++){
   const merged=harmonize(v,parents[i].candidate,parents[j].candidate).candidate;
   merged.id="round-"+round+"-"+parents[i].candidate.id+"-"+parents[j].candidate.id;
   merged.origin="harmonizer-hypothesis";
   // A union of desirable traits is an aspiration, not demonstrated retention.
   merged.strengths=unique([...parents[i].candidate.strengths,...parents[j].candidate.strengths]);
   merged.evidence=[];
   const key=signature(merged);
   if(!seen.has(key)){seen.add(key);offspring.push(merged)}
  }
  if(!offspring.length)break;
  // Keep diverse original alternatives; never replace an evidenced input with an
  // unverified merge solely because its aspirational strengths score higher.
  population=[...population,...offspring].slice(0,maxCandidates);
 }
 const final=population.map(assess).sort((a,b)=>b.coverage-a.coverage||
  b.preservation-a.preservation||a.risks-b.risks||a.candidate.id.localeCompare(b.candidate.id));
 return {version:"1.1.0",rules:RULES,vision:v.vision,rounds:ledger,
  candidates:final.map(x=>({candidate:x.candidate,coverage:x.coverage,
   preservation:x.preservation,findings:x.findings,status:x.status})),
  negativeFlips:v.negatives.map(flipper),
  fifthCompass:fifthCompass(v,final.flatMap(x=>x.findings)),
  recommendation:final.length?{candidateId:final[0].candidate.id,
   status:"provisional-ranking-not-proof",reason:"Requirement coverage and preservation claims, penalized for outstanding findings."}:null,
  stoppingReason:!v.candidates.length?"No concrete candidates; external creative generation is required.":
   "Bounded exploration completed; real-world verification required before declaring improvement.",
  provenance:{source:"supplied-candidates",simulationsRun:0,independentValidation:false,
   note:"This is rule-conditioned candidate exploration, not a Monte Carlo simulation or autonomous AI deliberation."}};
}
function evaluate(input){
 const v=normalize(input),ideas=ponderer(v),reviews=v.candidates.map(c=>({candidate:c,findings:compasses(v,c)}));
 const merges=[];
 for(let i=0;i<Math.min(4,v.candidates.length);i++)for(let j=i+1;j<Math.min(4,v.candidates.length);j++)merges.push(harmonize(v,v.candidates[i],v.candidates[j]));
 const allFindings=reviews.flatMap(x=>x.findings).concat(merges.flatMap(x=>x.findings));
 return {version:"1.0.0",rules:RULES,vision:v.vision,ideas,negativeFlips:v.negatives.map(flipper),
  reviews,merges,fifthCompass:fifthCompass(v,allFindings),
  mirrorCat:{status:"requires-evidence",warnings:unique([
   ...(!v.vision?["No original vision supplied."]:[]),
   ...(!v.candidates.length?["No real candidates supplied; suggested approaches are exploratory only."]:[]),
   ...allFindings.map(x=>x.type+": "+x.detail)])},
  genari:{recordType:"proposed-analysis",source:"user-endeavor-input",preserveOriginal:true,
   evidenceStatus:"unverified-until-tested",candidateCount:v.candidates.length},
  nextAction:"Build or revise the actual endeavor; validate requirements, consent, preservation, and outcomes before claiming improvement."};
}
const api=Object.freeze({RULES,normalize,ponderer,flipper,compasses,harmonize,fifthCompass,evaluate,evolve,analyzePlan:evaluate,doubleHarmonize:(a,b,context={})=>harmonize(normalize(context),normalize({candidates:[a]}).candidates[0],normalize({candidates:[b]}).candidates[0])});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.SHANEGenies=api;
})(typeof window!=="undefined"?window:undefined);
