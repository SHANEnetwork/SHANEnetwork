/* Maps SHANE's reusable composition contract onto existing SHANE database entities.
   Pure plans only: persistence requires authenticated, RLS-protected calls. */
(function(root,factory){
 const api=factory(root.SHANEComposition||(typeof module==="object"&&module.exports?require("./shane-composition.js"):null));
 if(typeof module==="object"&&module.exports)module.exports=api;else root.SHANEEndeavorAdapter=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(engine){
 "use strict";
 if(!engine)throw Error("Composition engine required");
 const supported=Object.freeze({
  pages:"shane_sites",memberships:"shane_organization_members",
  discussions:"shane_organization_discussions",
  discovery:"shane_organization_opportunities",
  events:null,projects:null,publications:null,messaging:null
 });
 function plan(spec){
  const errors=engine.validate(spec);if(errors.length)throw Error(errors.join("; "));
  const modules=spec.modules.map(m=>({
   type:m.type,version:m.version,
   storage:supported[m.type]||null,
   state:supported[m.type]?"existing_storage_requires_scoped_integration":"requires_reusable_implementation"
  }));
  return {
   schemaVersion:spec.schemaVersion,endeavorId:spec.endeavorId,title:spec.title,
   existingEntities:["shane_endeavors","shane_sites","shane_organizations","shane_organization_config_versions"],
   modules,automaticProvisioning:false,
   explanation:"This plan does not write records or grant access. Every future write must be authenticated and scoped to its owner or organization."
  };
 }
 return Object.freeze({plan});
});
