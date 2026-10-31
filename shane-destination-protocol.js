/* SHANE Network public destination protocol v1.
   Pure validation and serialization: no automatic publication, user transfer or network calls. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.SHANEDestinationProtocol=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const VERSION="1.0";
 const TYPES=new Set(["community","endeavor","organization","project","service","event","research","creative"]);
 function secureUrl(value){
  const u=new URL(String(value||""));
  if(u.protocol!=="https:"||u.username||u.password||!u.hostname||u.hash)throw Error("A public HTTPS destination URL is required.");
  return u.href;
 }
 function prepare(input,{approved=false}={}){
  if(!approved)throw Error("Administrator approval is required to expose a destination.");
  if(!input||typeof input!=="object")throw Error("Destination description required.");
  const name=String(input.name||"").trim();
  const description=String(input.description||"").trim();
  if(!name||name.length>150||description.length>2000)throw Error("Invalid destination name or description.");
  const category=TYPES.has(input.category)?input.category:"endeavor";
  const website=secureUrl(input.website);
  const contact=input.contact?secureUrl(input.contact):null;
  return Object.freeze({protocol:"shane-network-destination",version:VERSION,name,description,category,website,contact,
   visibility:"public",memberDataShared:false,authenticationFederated:false,messagingFederated:false});
 }
 function read(input){
  if(!input||input.protocol!=="shane-network-destination"||input.version!==VERSION)throw Error("Unsupported destination descriptor.");
  return prepare(input,{approved:true});
 }
 return Object.freeze({VERSION,prepare,read});
});
