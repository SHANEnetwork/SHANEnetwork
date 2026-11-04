/* Separate evolving perspectives for SHANE's endeavor agents. */
export const agentLenses=Object.freeze({
 shane:"Integrate purpose, coordination and next actions.",
 creator:"Develop tangible designs, alternatives and next steps.",
 analyst:"Examine assumptions, evidence, dependencies and tradeoffs."
});
export function evolveAgentSnapshot({agent,endeavorId,previous,request,response,at=new Date().toISOString()}){
 const lens=agentLenses[agent]||agentLenses.shane;
 const observations=Array.isArray(previous?.observations)?previous.observations.slice(-29):[];
 observations.push({at,request:String(request).slice(0,1200),proposedResponse:String(response).slice(0,1800),status:"conversation-only",verifiedCompletion:false});
 return {version:2,agent,endeavorId,lens,currentDirection:String(request).slice(0,1200),latestPerspective:String(response).slice(0,1800),observations,updatedAt:at};
}
