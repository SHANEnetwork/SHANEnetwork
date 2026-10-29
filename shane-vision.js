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
  {type:"events",pattern:/\b(event|events|conference|festival|concert|meetup|workshop|tournament)\b/i},
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
 return Object.freeze({interpret});
});
