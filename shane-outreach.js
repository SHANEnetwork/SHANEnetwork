/* SHANE outreach planning. Pure functions; does not search, contact, or send. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.SHANEOutreach=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
function plan(endeavor,contacts=[]){
 if(!Array.isArray(contacts))throw Error("Contacts must be an array");
 return contacts.map((contact,index)=>{
  const name=String(contact?.name||"Unverified contact");
  const purpose=String(contact?.purpose||"Clarify whether this contact can help with the endeavor");
  const channel=contact?.verifiedEmail?{kind:"email",address:String(contact.verifiedEmail)}:contact?.verifiedUrl?{kind:"website",url:String(contact.verifiedUrl)}:null;
  const verified=Boolean(contact?.verifiedSource&&channel);
  return {id:String(contact?.id||index+1),name,purpose,channel,source:contact?.verifiedSource||null,verification:verified?"source_provided_unchecked":"research_required",request:"Ask about "+purpose.toLowerCase(),materials:["A concise overview of "+String(endeavor?.title||"the endeavor"),"A specific request and relevant supporting evidence"],status:"draft_only",sent:false};
 });
}
return Object.freeze({plan});
});
