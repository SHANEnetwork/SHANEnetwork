/* SHANE vision interpreter: deterministic, revisable composition suggestions.
   Never represents a suggested capability as a provisioned service. */
(function(root,factory){
 const api=factory(root.SHANEComposition || (typeof module==="object"&&module.exports?require("./shane-composition.js"):null));
 if(typeof module==="object"&&module.exports)module.exports=api;else root.SHANEVision=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(engine){
 "use strict";
 if(!engine)throw Error("SHANE composition engine is required");
 const rules=[
  {type:"memberships",pattern:/\b(member|members|membership|club|association|league|organization|community)\b/i},
  {type:"projects",pattern:/\b(project|projects|research|initiative|invention|portfolio)\b/i},
  {type:"publications",pattern:/\b(publication|publications|articles|journal|library|papers|research papers)\b/i},
  {type:"events",pattern:/\b(event|events|conferences?|festivals?|concerts?|meetups?|workshops?|tournaments?)\b/i},
  {type:"discussions",pattern:/\b(forum|forums|discussion|discussions|conversation|conversations|chatrooms?)\b/i},
  {type:"messaging",pattern:/\b(message|messages|messaging|private chat|direct chat)\b/i},
  {type:"discovery",pattern:/\b(partner|partners|collaborator|collaborators|opportunities|discover|directory|network)\b/i}
 ];
 function interpret(vision,{endeavorId,title}={}){
  if(typeof vision!=="string"||!vision.trim())throw Error("A vision description is required");
  const modules=["pages",...rules.filter(r=>r.pattern.test(vision)).map(r=>r.type)];
  const spec=engine.compose({endeavorId:endeavorId||"unsaved-draft",title:title||"My Endeavor",modules});
  return {spec,sourceVision:vision,provisioningStatus:"not_provisioned",notes:"Capabilities are suggestions only. No private spaces, database records, or external services have been created."};
 }
 function revise(spec,instruction){
  const problems=engine.validate(spec);if(problems.length)throw Error(problems.join("; "));
  if(typeof instruction!=="string"||!instruction.trim())throw Error("Describe the change you want");
  const text=instruction.trim();
  const addIntent=/\b(?:add|include|enable|create|introduce|set up|build)\b/i.test(text);
  const removeIntent=/\b(?:remove|delete|disable|without|no longer|stop using)\b/i.test(text);
  if(addIntent&&removeIntent)throw Error("Mixed additions and removals need separate requests so existing features stay safe");
  if(/\b(?:don't|do not|never|not)\s+(?:add|include|enable|create|build)\b/i.test(text))throw Error("Negated additions need clarification before changing capabilities");
  if(!addIntent&&!removeIntent)throw Error("Please say add or remove and name the capability to change");
  const remove=removeIntent;
  const matched=rules.filter(rule=>rule.pattern.test(text)).map(rule=>rule.type);
  if(/\b(?:all|everything|entire site|whole website)\b/i.test(text))throw Error("Broad changes need a specific list of capabilities before SHANE can safely revise this endeavor");
  if(/\b(?:replace|start over|reset|clear|wipe|rebuild from scratch)\b/i.test(text))throw Error("Replacement requests need an explicit new endeavor; the existing project remains unchanged");

  if(/\b(?:page|pages|website|webpage)\b/i.test(text))matched.push("pages");
  if(!matched.length)throw Error("No supported capability identified; describe pages, projects, publications, events, memberships, messages, discussions, or a directory");
  const enabled=new Set(spec.modules.map(m=>m.type));
  if(remove){for(const type of matched)enabled.delete(type)}
  else for(const type of matched)enabled.add(type);
  if(remove&&matched.includes("memberships")&&(enabled.has("messaging")||enabled.has("discussions")))throw Error("Memberships are required for messaging and discussions; remove those features first");
  const next=engine.compose({endeavorId:spec.endeavorId,title:spec.title,modules:[...enabled],appearance:spec.appearance||{}});
  for(const module of next.modules){const prior=spec.modules.find(m=>m.type===module.type);if(prior?.labels)module.labels={...prior.labels}}
  const errors=engine.validate(next);if(errors.length)throw Error(errors.join("; "));
  return {spec:next,matched,action:remove?"remove":"add",provisioningStatus:"not_provisioned"};
 }
 return Object.freeze({interpret,revise});
});
