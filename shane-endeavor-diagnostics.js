/* Local, privacy-preserving structural diagnostics for saved SHANE endeavors.
 * This module does not transmit telemetry or claim that remote services are healthy.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.SHANEEndeavorDiagnostics=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const validId=value=>typeof value==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
function inspect(endeavor){
 const findings=[];
 const add=(code,severity,message)=>findings.push({code,severity,message});
 if(!endeavor||typeof endeavor!=="object"){add("missing-endeavor","error","No saved endeavor was provided.");return {ok:false,findings};}
 if(!validId(endeavor.id))add("invalid-endeavor-id","error","Saved endeavor ID is missing or invalid.");
 if(!endeavor.persisted)add("not-persisted","warning","Endeavor has not been confirmed as saved.");
 if(endeavor.linkedSiteId&&!validId(endeavor.linkedSiteId))add("invalid-site-link","error","Linked website ID is invalid.");
 if(endeavor.linkedOrganizationId&&!validId(endeavor.linkedOrganizationId))add("invalid-organization-link","error","Linked organization ID is invalid.");
 if(endeavor.spec&&!["object"].includes(typeof endeavor.spec))add("invalid-composition","error","Saved composition is not an object.");
 if(!Array.isArray(endeavor.conversation))add("missing-conversation","warning","Conversation history is unavailable for continuity.");
 return Object.freeze({ok:!findings.some(x=>x.severity==="error"),endeavorId:validId(endeavor.id)?endeavor.id:null,checkedAt:new Date().toISOString(),scope:"local-structure-only",findings:Object.freeze(findings)});
}
return Object.freeze({inspect});
});
