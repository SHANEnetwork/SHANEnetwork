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
  directionHistory,milestones,observations,updatedAt:at
 };
}
