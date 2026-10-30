/* One endeavor's orchestration status, derived from confirmed persisted links.
 * Never treat planned capabilities as provisioned or publish anything.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.SHANEEndeavorOrchestrator=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 function inspect(endeavor,listing){
  if(!endeavor||!endeavor.persisted||!endeavor.id)throw Error("Saved endeavor required");
  const status={
   endeavor:{state:"ready",id:endeavor.id},
   website:{state:endeavor.linkedSiteId?"linked":"needs-setup",id:endeavor.linkedSiteId||null},
   organization:{state:endeavor.linkedOrganizationId?"linked":"needs-setup",id:endeavor.linkedOrganizationId||null},
   network:{state:listing?.endeavor_id===endeavor.id?(listing.status==="published"?"published":"private-draft"):"needs-setup",id:listing?.endeavor_id===endeavor.id?listing.id:null},
   analyst:{state:"handoff-only"},
   legal:{state:"drafting-context-only"},
   professionals:{state:"not-integrated"},
   communications:{state:"not-verified"},
   games:{state:"not-verified"},
   commerce:{state:"not-activated"}
  };
  return Object.freeze(Object.fromEntries(Object.entries(status).map(([name,value])=>[name,Object.freeze(value)])));
 }
 return Object.freeze({inspect});
});
