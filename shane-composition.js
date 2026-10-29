/* SHANE reusable composition foundation. Pure, side-effect-free; no credentials or network. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  else root.SHANEComposition=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const VERSION=1;
  const MODULES=Object.freeze({
    pages:{version:1,fields:["title","body"],requires:[]},
    projects:{version:1,fields:["title","description"],requires:[]},
    publications:{version:1,fields:["title","description"],requires:[]},
    events:{version:1,fields:["title","description","date"],requires:[]},
    memberships:{version:1,fields:["display_name"],requires:[]},
    messaging:{version:1,fields:["body"],requires:["memberships"]},
    discussions:{version:1,fields:["title","body"],requires:["memberships"]},
    discovery:{version:1,fields:["title","description"],requires:[]}
  });
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const clone=x=>JSON.parse(JSON.stringify(x));
  function validate(spec){
    const errors=[];
    if(!spec||typeof spec!=="object"||Array.isArray(spec))return ["Specification must be an object"];
    if(spec.schemaVersion!==VERSION)errors.push("Unsupported schema version");
    if(typeof spec.endeavorId!=="string"||!spec.endeavorId.trim())errors.push("Missing endeavorId");
    if(typeof spec.title!=="string"||!spec.title.trim())errors.push("Missing title");
    if(!Array.isArray(spec.modules))errors.push("Modules must be an array");
    else{
      const seen=new Set();
      for(const m of spec.modules){
        if(!m||typeof m!=="object"||!own(MODULES,m.type)){errors.push("Unknown module");continue;}
        if(seen.has(m.type))errors.push("Duplicate module: "+m.type);
        seen.add(m.type);
        if(m.version!==MODULES[m.type].version)errors.push("Incompatible module version: "+m.type);
        if(m.labels!==undefined&&(!m.labels||typeof m.labels!=="object"||Array.isArray(m.labels)||Object.entries(m.labels).some(([k,v])=>!MODULES[m.type].fields.includes(k)||typeof v!=="string")))errors.push("Invalid labels: "+m.type);
      }
      for(const m of spec.modules)if(m&&own(MODULES,m.type))for(const dependency of MODULES[m.type].requires)if(!seen.has(dependency))errors.push(m.type+" requires "+dependency);
    }
    return errors;
  }
  function compose({endeavorId,title,modules=[],appearance={}}){
    const unique=new Set(modules);
    let changed=true;
    while(changed){changed=false;for(const type of [...unique]){
      if(!own(MODULES,type))throw Error("Unsupported capability: "+type);
      for(const dependency of MODULES[type].requires)if(!unique.has(dependency)){unique.add(dependency);changed=true;}
    }}
    const spec={schemaVersion:VERSION,endeavorId,title,modules:[...unique].map(type=>({type,version:MODULES[type].version,labels:{}})),appearance:clone(appearance)};
    const errors=validate(spec);if(errors.length)throw Error(errors.join("; "));
    return spec;
  }
  function refine(spec,changes){
    const errors=validate(spec);if(errors.length)throw Error(errors.join("; "));
    if(!changes||typeof changes!=="object"||Array.isArray(changes))throw Error("Invalid changes");
    const next=clone(spec);
    if(own(changes,"title"))next.title=changes.title;
    if(own(changes,"appearance"))next.appearance={...next.appearance,...clone(changes.appearance)};
    if(own(changes,"labels"))for(const [type,labels] of Object.entries(changes.labels)){
      const module=next.modules.find(m=>m.type===type);
      if(!module)throw Error("Module not enabled: "+type);
      module.labels={...module.labels,...clone(labels)};
    }
    const problems=validate(next);if(problems.length)throw Error(problems.join("; "));
    return next;
  }
  return Object.freeze({VERSION,MODULES,validate,compose,refine});
});
