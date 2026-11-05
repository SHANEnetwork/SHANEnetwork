/* Durable, endeavor-scoped perspectives for SHANE's cooperating agents. */
export const agentLenses=Object.freeze({
 shane:"Integrate purpose, coordination and next actions.",
 creator:"Develop tangible designs, alternatives and next steps.",
 analyst:"Examine assumptions, evidence, dependencies and tradeoffs."
});
const clip=(value,length)=>String(value||"").trim().slice(0,length);
export function evolveAgentSnapshot({agent,endeavorId,previous,request,response,at=new Date().toISOString()}){
 const lens=agentLenses[agent]||agentLenses.shane;
 const observations=Array.isArray(previous?.observations)?previous.observations.slice(-29):[];
 const next={at,request:clip(request,1200),proposedResponse:clip(response,1800),status:"conversation-only",verifiedCompletion:false};
 observations.push(next);
 const directionHistory=Array.isArray(previous?.directionHistory)?previous.directionHistory.slice(-19):[];
 if(next.request&&directionHistory[directionHistory.length-1]?.text!==next.request)
  directionHistory.push({at,text:next.request,source:"member-request"});
 const milestones=Array.isArray(previous?.milestones)?previous.milestones.slice(-39):[];
 return {
  version:3,agent,endeavorId,lens,
  currentDirection:next.request,latestPerspective:next.proposedResponse,
  directionHistory,milestones,betterIdeas:Array.isArray(previous?.betterIdeas)?previous.betterIdeas:[],concepts:Array.isArray(previous?.concepts)?previous.concepts:[],observations,updatedAt:at
 };
}

export function recordAgentMilestone({agent,endeavorId,previous,description,receiptId,at=new Date().toISOString()}){
 const base=previous&&typeof previous==="object"?previous:{};
 const milestones=Array.isArray(base.milestones)?base.milestones.slice(-39):[];
 const id=clip(receiptId,120);
 const text=clip(description,2000);
 if(!id||!text)throw Error("A saved creation receipt and description are required.");
 if(!milestones.some(item=>item.receiptId===id))milestones.push({at,receiptId:id,description:text,status:"confirmed-record"});
 return {...base,version:3,agent,endeavorId,lens:agentLenses[agent]||agentLenses.shane,milestones,updatedAt:at};
}

export function rememberBetterIdea({agent,endeavorId,previous,idea,reason,comparedWith="",at=new Date().toISOString()}){
 const text=clip(idea,2000);
 if(!text)throw Error("An improvement idea is required.");
 const ideas=Array.isArray(previous?.betterIdeas)?previous.betterIdeas.slice(-39):[];
 if(!ideas.some(item=>item.idea===text)){
  ideas.push({at,idea:text,reason:clip(reason,1200),comparedWith:clip(comparedWith,1200),status:"candidate"});
 }
 return {...(previous||{}),version:4,agent,endeavorId,lens:agentLenses[agent]||agentLenses.shane,betterIdeas:ideas,updatedAt:at};
}

/* Ponderer compares alternatives; Harmonizer combines complementary strengths.
   Scores are transparent heuristic signals, never claims of validated performance. */
export function ponderHarmonize({agent,endeavorId,previous,criteria=["impact","feasibility","originality"],at=new Date().toISOString()}){
 const ideas=Array.isArray(previous?.betterIdeas)?previous.betterIdeas:[];
 const candidates=ideas.filter(item=>item.status==="candidate"||item.status==="promising");
 if(candidates.length<2)return {snapshot:previous||null,comparison:null};
 const dimensions=criteria.filter(x=>typeof x==="string"&&x.length<40).slice(0,6);
 const ranked=candidates.map(item=>{
  const text=(item.idea+" "+item.reason).toLowerCase();
  const evidence=dimensions.map(criterion=>({
   criterion,
   mentions:text.includes(criterion.toLowerCase())
  }));
  return {item,evidence,score:evidence.filter(x=>x.mentions).length};
 }).sort((a,b)=>b.score-a.score||a.item.at.localeCompare(b.item.at));
 const [first,second]=ranked;
 const sources=[first.item.idea,second.item.idea];
 const concepts=Array.isArray(previous?.concepts)?previous.concepts.slice(-39):[];
 const existing=concepts.find(x=>x.sources?.join("|")===sources.join("|"));
 if(existing)return {snapshot:previous||null,comparison:null};
 const tokens=value=>new Set(String(value||"").toLowerCase().match(/[a-z]{4,}/g)||[]);
 const aTokens=tokens(first.item.idea),bTokens=tokens(second.item.idea);
 const shared=[...aTokens].filter(x=>bTokens.has(x)).slice(0,8);
 const distinctA=[...aTokens].filter(x=>!bTokens.has(x)).slice(0,8);
 const distinctB=[...bTokens].filter(x=>!aTokens.has(x)).slice(0,8);
 const focus=clip(previous?.currentDirection||"the endeavor's stated objective",180);
 const hypothesis="Test an approach to "+focus+" that preserves "+clip(first.item.idea,250)+" while addressing "+clip(second.item.idea,250)+".";
 const concept={
  at,kind:"harmonized-concept",status:"proposed",criteria:dimensions,
  sources,concept:hypothesis,
  rationale:"Compare both proposals against the endeavor's objective; retain complementary strengths and explicitly investigate tensions instead of assuming either proposal wins.",
  sharedThemes:shared,distinctStrengths:[distinctA,distinctB],
  openQuestion:"Which constraints or evidence would make this synthesis better than either source?",
  comparison:ranked.map(x=>({idea:x.item.idea,score:x.score,evidence:x.evidence})),
  evaluation:"Provisional synthesis hypothesis from recorded text; not an AI-validated breakthrough."
 };
 concepts.push(concept);
 const evolvedIdeas=ideas.slice(-39);
 if(!evolvedIdeas.some(x=>x.idea===hypothesis))evolvedIdeas.push({at,idea:hypothesis,reason:"Derived from comparison of two archived improvement candidates; evaluate against both source ideas.",comparedWith:sources.join(" | ").slice(0,1200),status:"candidate",source:{type:"ponder-harmonizer",sources}});
 return {snapshot:{...(previous||{}),version:6,agent,endeavorId,betterIdeas:evolvedIdeas,concepts,updatedAt:at},comparison:concept};

}

/* Extract explicitly suggested improvements from an archived chapter.
   Preserve provenance; do not reinterpret every conversational sentence as a proposal. */
export function harvestChapterIdeas({agent="creator",endeavorId,previous,chapter,turns,at=new Date().toISOString()}){
 let snapshot=previous||{agent,endeavorId};
 const matches=[];
 const signal=/\b(?:better idea|better approach|instead we (?:could|should)|what if we|i suggest|i propose|we could improve|perhaps we should|another option is)\b/i;
 for(const turn of turns||[]){
  if(typeof turn?.body!=="string"||!Number.isSafeInteger(turn.turn_number))continue;
  const sentences=turn.body.split(/(?<=[.!?])\s+|\n+/).map(x=>x.trim()).filter(Boolean);
  for(const sentence of sentences){
   if(!signal.test(sentence)||sentence.length<20)continue;
   const idea=clip(sentence,700);
   const before=snapshot.betterIdeas?.length||0;
   snapshot=rememberBetterIdea({agent,endeavorId,previous:snapshot,idea,reason:"Explicitly proposed in archived conversation",comparedWith:"",at});
   if((snapshot.betterIdeas?.length||0)>before){
    const item=snapshot.betterIdeas[snapshot.betterIdeas.length-1];
    item.source={type:"vortex-chapter",chapter,turnNumber:turn.turn_number,role:turn.role};
    matches.push(item);
   }
  }
 }
 return {snapshot,harvested:matches};
}
