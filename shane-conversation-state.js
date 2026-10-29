/* Private, per-endeavor conversation continuity through existing owner-scoped
   shane_endeavors.plan JSON. No automatic publishing or external actions. */
(function(root,factory){
 const api=factory(root.SHANEComposition||(typeof module==="object"&&module.exports?require("./shane-composition.js"):null));
 if(typeof module==="object"&&module.exports)module.exports=api;else root.SHANEConversationState=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(engine){
 "use strict";
 if(!engine)throw Error("Composition engine required");
 const MAX_TURNS=1000,MAX_TEXT=12000;
 function checkTurns(turns){
  if(!Array.isArray(turns)||turns.length>MAX_TURNS)throw Error("Invalid conversation length");
  for(const t of turns)if(!t||!["you","shane"].includes(t.role)||typeof t.text!=="string"||t.text.length>MAX_TEXT)throw Error("Invalid conversation turn");
 }
 function pack(spec,turns){
  const errors=engine.validate(spec);if(errors.length)throw Error(errors.join("; "));
  checkTurns(turns);
  return JSON.stringify({...spec,conversation:turns.map(t=>({role:t.role,text:t.text}))});
 }
 function unpack(raw){
  const parsed=typeof raw==="string"?JSON.parse(raw):raw;
  const errors=engine.validate(parsed);if(errors.length)throw Error(errors.join("; "));
  const turns=parsed.conversation||[];checkTurns(turns);
  return {spec:parsed,turns:turns.map(t=>({role:t.role,text:t.text}))};
 }
 function append(raw,role,text){
  const {spec,turns}=unpack(raw);
  checkTurns([{role,text}]);
  if(turns.length>=MAX_TURNS)throw Error("Conversation limit reached; preserve earlier turns in an archive before continuing");
  return pack(spec,[...turns,{role,text}]);
 }
 return Object.freeze({pack,unpack,append,MAX_TURNS});
});
