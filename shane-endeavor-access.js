/* Shared endeavor access policy. Pure, side-effect-free permission decisions.
 * Invitations do not transfer ownership; publication is a separate action.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.SHANEEndeavorAccess=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const actions=Object.freeze(["view","comment","edit","invite","manage","publish"]);
 const permissions=Object.freeze({
  viewer:["view"],
  contributor:["view","comment"],
  editor:["view","comment","edit"],
  manager:["view","comment","edit","invite","manage"],
  owner:actions
 });
 const validId=x=>typeof x==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
 function authorize({ownerId,actorId,action,members=[]}={}){
  if(!validId(ownerId)||!validId(actorId)||!actions.includes(action))return false;
  if(ownerId===actorId)return true;
  if(!Array.isArray(members))return false;
  const member=members.find(m=>m&&m.userId===actorId&&m.status==="active");
  if(!member||!Object.prototype.hasOwnProperty.call(permissions,member.role))return false;
  return permissions[member.role].includes(action);
 }
 function inspect({ownerId,actorId,members=[]}={}){
  return Object.freeze(Object.fromEntries(actions.map(action=>[action,authorize({ownerId,actorId,members,action})])));
 }
 return Object.freeze({actions,permissions,authorize,inspect});
});
