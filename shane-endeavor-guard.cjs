// SHANE Endeavor Guard: pure, read-only, bounded continuity checks.
// Intended for lightweight checks during authoring and deeper checks at release.
// Never modifies records, grants permissions, or declares a release approved.
'use strict';
function inspect(snapshot,{level='quick'}={}){
 if(!['quick','deep'].includes(level))throw Error('Unknown inspection level');
 if(!snapshot||typeof snapshot!=='object')throw Error('Endeavor snapshot required');
 const findings=[],add=(code,severity,detail)=>findings.push({code,severity,detail,verified:false});
 const id=String(snapshot.id||'').trim(),owner=String(snapshot.ownerId||'').trim();
 if(!id)add('missing-endeavor-id','critical','Endeavor identity is missing');
 if(!owner)add('missing-owner','critical','Endeavor ownership is missing');
 if(!String(snapshot.originalVision||'').trim())add('missing-original-vision','critical','Original vision is missing');
 const components=Array.isArray(snapshot.components)?snapshot.components:[];
 const seen=new Set();
 for(const c of components){
  const key=String(c.id||'').trim();
  if(!key)add('missing-component-id','high','Component has no stable identity');
  else if(seen.has(key))add('duplicate-component-id','high','Duplicate component '+key);
  seen.add(key);
  if(c.endeavorId!==undefined&&String(c.endeavorId)!==id)add('foreign-endeavor-component','critical','Component references another endeavor');
  if(c.ownerId!==undefined&&String(c.ownerId)!==owner)add('foreign-owner-component','critical','Component owner differs from endeavor owner');
 }
 if(level==='deep'){
  const history=Array.isArray(snapshot.history)?snapshot.history:[];
  const revisions=new Set();
  for(const h of history){
   const revision=String(h.id||'').trim();
   if(!revision||revisions.has(revision))add('invalid-history-id','high','History entry identity missing or duplicated');
   revisions.add(revision);
   if(h.endeavorId!==undefined&&String(h.endeavorId)!==id)add('foreign-history-entry','critical','History entry references another endeavor');
  }
  const relations=Array.isArray(snapshot.collaborations)?snapshot.collaborations:[];
  for(const r of relations){
   if(r.endeavorId!==undefined&&String(r.endeavorId)!==id)add('foreign-collaboration','critical','Collaboration references another endeavor');
   if(r.status==='accepted'&&!String(r.acceptedBy||'').trim())add('unverified-collaboration-acceptance','high','Accepted collaboration lacks accepting account');
  }
 }
 return {schema:'shane.endeavor.guard',version:1,level,endeavorId:id||null,checked:{components:components.length,history:level==='deep'?(snapshot.history||[]).length:0},findings,status:findings.length?'Review required':'No structural discrepancy found; real-account verification still required',releaseApproved:false,security:{networkAccess:false,changesApplied:false,permissionsGranted:false}};
}
module.exports={inspect};
