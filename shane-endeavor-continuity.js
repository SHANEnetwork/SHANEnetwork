/* Versioned, user-controlled endeavor state. Shared across SHANE pages in one browser session, not published sites.
   Story scenes, campaigns, communities and other modules can save structured milestones
   without changing existing forms or replacing their databases. */
(()=>{"use strict";
 const prefix="shane-endeavor-milestones-v1:";
 const validId=id=>typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id);
 const active=()=>window.SHANECurrentEndeavor?.read?.()||null;
 const key=id=>prefix+id;
 const clean=value=>JSON.parse(JSON.stringify(value));
 const read=(id=active())=>{
  if(!validId(id))return {endeavorId:null,revision:0,milestones:[]};
  try{const raw=JSON.parse(sessionStorage.getItem(key(id))||"null");return raw&&raw.endeavorId===id&&Array.isArray(raw.milestones)?raw:{endeavorId:id,revision:0,milestones:[]}}
  catch{return {endeavorId:id,revision:0,milestones:[]}}
 };
 const checkpoint=({endeavorId=active(),kind="milestone",title="",state={},note=""}={})=>{
  if(!validId(endeavorId))throw Error("Select an endeavor before saving a milestone.");
  if(!state||typeof state!=="object"||Array.isArray(state))throw Error("Milestone state must be an object.");
  const doc=read(endeavorId);
  const item={revision:doc.revision+1,at:new Date().toISOString(),kind:String(kind).slice(0,64),title:String(title).slice(0,200),note:String(note).slice(0,2000),state:clean(state)};
  if(JSON.stringify(item).length>100000)throw Error("Milestone exceeds storage limit.");
  doc.revision=item.revision;doc.milestones.push(item);
  // Never silently discard earlier revisions. Surface storage errors to caller.
  sessionStorage.setItem(key(endeavorId),JSON.stringify(doc));
  document.dispatchEvent(new CustomEvent("shane:endeavor-milestone",{detail:{endeavorId,revision:item.revision,kind:item.kind}}));
  return clean(item);
 };
 const version=(revision,id=active())=>read(id).milestones.find(item=>item.revision===revision)||null;
 const restore=(revision,id=active())=>{
  const previous=version(revision,id);if(!previous)throw Error("Revision not found.");
  // Restoration creates a new revision rather than deleting history.
  return checkpoint({endeavorId:id,kind:"restore",title:previous.title,state:previous.state,note:"Restored from revision "+revision});
 };
 const exportState=(id=active())=>JSON.stringify(read(id),null,2);
 window.SHANEEndeavorMilestones=Object.freeze({read,checkpoint,version,restore,exportState});
 document.dispatchEvent(new Event("shane:endeavor-milestones-ready"));
})();
