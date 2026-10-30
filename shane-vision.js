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
  const remove=/\b(?:remove|delete|disable|without|no longer|stop using)\b/i.test(text);
  const matched=rules.filter(rule=>rule.pattern.test(text)).map(rule=>rule.type);
  if(!matched.length)throw Error("No supported capability identified; describe a page, project, publication, event, membership, message, discussion, or directory");
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
