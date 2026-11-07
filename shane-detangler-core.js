/* SHANE Detangler v1: deterministic, local, evidence-based diagnostics.
   No remote access, writes, code execution, or speculative "fixed" claims. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SHANEDetangler=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const rules=[
{id:'html-duplicate-id',kinds:['html'],title:'Duplicate HTML IDs',test:s=>{const ids=[...s.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(x=>x[1]);return ids.some((x,i)=>ids.indexOf(x)!==i);},explanation:'Two or more elements use the same ID. Selectors, labels, and scripts may target the wrong element.',nextStep:'List duplicate IDs, correct them in an isolated branch, then rerun browser interactions.'},
{id:'html-collapsed-details',kinds:['html','notes'],title:'Content may be hidden inside a collapsed disclosure',test:s=>/<details\b(?![^>]*\bopen\b)[^>]*>[\s\S]*?<(?:form|textarea|input)\b/i.test(s),explanation:'Interactive controls appear inside a details element without an open attribute. They may be inaccessible until the disclosure is expanded.',nextStep:'Inspect the rendered ancestor chain and verify that primary entry controls remain visible.'},
{id:'html-insecure-target',kinds:['html'],title:'New-tab links without rel protection',test:s=>/<a\b(?=[^>]*target\s*=\s*["']_blank["'])(?![^>]*rel\s*=\s*["'][^"']*noopener)[^>]*>/i.test(s),explanation:'A new-tab link may omit an explicit noopener relationship. Modern browsers often imply this, but explicit protection improves compatibility.',nextStep:'Inspect affected links and add rel="noopener noreferrer" where appropriate.'},
{id:'log-unauthorized',kinds:['logs','notes'],title:'Authorization or permission failures',test:s=>/\b(401|403|unauthori[sz]ed|permission denied|row.level security|access denied)\b/i.test(s),explanation:'The evidence mentions an authorization boundary failure. This may be expected security enforcement or an unintended denial.',nextStep:'Reproduce with permitted test accounts; inspect policies and server-side authorization without weakening access controls.'},
{id:'log-missing',kinds:['logs','notes'],title:'Missing resource or route',test:s=>/\b(404|not found|module not found|failed to fetch|ERR_NAME_NOT_RESOLVED)\b/i.test(s),explanation:'The evidence suggests a missing endpoint, asset, module, or unreachable resource.',nextStep:'Confirm the exact request URL, deployed path, response status, and build artifact.'},
{id:'log-timeout',kinds:['logs','notes'],title:'Timeout or stalled operation',test:s=>/\b(timed?\s*out|timeout|deadline exceeded|navigation timeout)\b/i.test(s),explanation:'A timed-out operation may be blocked by network, dependencies, hidden controls, or slow execution.',nextStep:'Capture a timing trace and determine the last successful step before increasing timeouts.'},
{id:'js-silent-error',kinds:['javascript'],title:'Silent exception handling',test:s=>/catch\s*\([^)]*\)\s*\{\s*\}/.test(s),explanation:'An empty catch block can conceal operational failures and make investigations harder.',nextStep:'Add privacy-safe diagnostic logging and verify the error path with a focused test.'},
{id:'js-unsafe-html',kinds:['javascript'],title:'Potential untrusted HTML insertion',test:s=>/\.innerHTML\s*=|insertAdjacentHTML\s*\(/.test(s),explanation:'Dynamic HTML insertion can become an injection risk if its input is not trusted or sanitized.',nextStep:'Trace the data source; use textContent for plain text and appropriate sanitization for allowed markup.'},
{id:'js-eval',kinds:['javascript'],title:'Dynamic code evaluation',test:s=>/\beval\s*\(|\bnew\s+Function\s*\(/.test(s),explanation:'Runtime code evaluation increases injection and audit risks, especially with untrusted input.',nextStep:'Identify the caller and replace evaluation with explicit parsing or supported operations where feasible.'}
];
function analyze(input){
const name=String(input?.name||'').trim().slice(0,180),problem=String(input?.problem||'').trim().slice(0,10000),evidence=String(input?.evidence||'').slice(0,100000),kind=['html','javascript','logs','notes'].includes(input?.kind)?input.kind:'notes',mode=['standalone','endeavor','developer'].includes(input?.mode)?input.mode:'standalone';
if(!name||!problem)throw new Error('System name and problem description are required.');
const findings=rules.filter(r=>r.kinds.includes(kind)&&r.test(evidence)).map(({id,title,explanation,nextStep})=>({id,title,explanation,nextStep,confidence:'hypothesis',verified:false}));
if(!evidence.trim())findings.push({id:'evidence-needed',title:'Evidence needed',explanation:'No technical evidence was supplied. The reported behavior is recorded but cannot yet be traced.',nextStep:'Provide a redacted log, relevant source excerpt, or reproducible browser steps.',confidence:'unknown',verified:false});
if(evidence.trim()&&!findings.length)findings.push({id:'no-rule-match',title:'No known pattern matched',explanation:'The supplied evidence did not match the current deterministic rules. This does not establish that the system is healthy.',nextStep:'Collect a minimal reproduction and inspect dependencies and runtime state.',confidence:'unknown',verified:false});
return {schema:'shane.detangler.report',version:1,mode,name,problem,evidenceType:kind,evidenceIncluded:false,findings,status:'Unverified hypotheses; no changes made',nextActions:['Reproduce the issue in a controlled environment','Map affected components and dependencies','Test the smallest safe repair and run regression checks'],security:{remoteAccess:false,codeExecuted:false,changesApplied:false},createdAt:new Date().toISOString()};
}
function toText(report){return ['SHANE Detangler | Investigation report','System: '+report.name,'Mode: '+report.mode,'Problem: '+report.problem,'Status: '+report.status,'',...report.findings.flatMap(f=>[f.title,f.explanation,'Verify: '+f.nextStep,'']),'Next actions:',...report.nextActions.map(x=>'- '+x)].join('\n');}

/* Source-gateway and dependency review v1. Pure, deterministic, no network calls.
   Statuses are evidence assertions supplied by an authorized reviewer, not live checks. */
const sourceStatuses=Object.freeze(['verified','broken-link','inaccessible','outdated-revision','unverified','missing-documentation']);
const discrepancyKinds=Object.freeze(['broken-link','inaccessible-document','outdated-revision','unsupported-technical-claim','engineering-failure','missing-documentation','unresolved-dependency']);
function auditSources(input){
 const sources=Array.isArray(input?.sources)?input.sources:[], claims=Array.isArray(input?.claims)?input.claims:[], gates=Array.isArray(input?.gates)?input.gates:[];
 const sourceMap=new Map(), findings=[], gateMap=new Map();
 const clean=(v,n=500)=>String(v??'').trim().slice(0,n);
 function add(kind,ref,detail,severity='review',disposition='Collect and verify the controlling evidence',dependencies=[]){
   findings.push({id:'D-'+String(findings.length+1).padStart(3,'0'),kind,reference:clean(ref),detail:clean(detail,1000),severity,disposition,dependencies:[...new Set(dependencies.map(x=>clean(x)))],verified:kind==='engineering-failure',releaseApproved:false});
 }
 for(const s of sources){
  const id=clean(s.id);if(!id||sourceMap.has(id))throw Error('Source IDs must be unique and nonempty');
  if(!sourceStatuses.includes(s.status))throw Error('Invalid source status: '+id);
  const source={id,title:clean(s.title),url:clean(s.url,2000),revision:clean(s.revision),expectedRevision:clean(s.expectedRevision),status:s.status,evidenceRef:clean(s.evidenceRef)};
  sourceMap.set(id,source);
  if(s.status==='broken-link')add('broken-link',id,'Reported broken gateway: '+source.title,'high','Check the exact URL and HTTP result');
  if(s.status==='inaccessible')add('inaccessible-document',id,'Access to source is unverified or denied: '+source.title,'review','Request authorized access; do not infer missing engineering');
  if(s.status==='missing-documentation')add('missing-documentation',id,'Required record not supplied: '+source.title);
  if(s.status==='outdated-revision'||(source.revision&&source.expectedRevision&&source.revision!==source.expectedRevision))add('outdated-revision',id,'Revision '+source.revision+' differs from controlling '+source.expectedRevision,'high','Reconcile the master index and preserve original revisions');
 }
 for(const c of claims){
  const id=clean(c.id);if(!id)throw Error('Claim ID required');
  const refs=Array.isArray(c.sourceIds)?c.sourceIds.map(x=>clean(x)):[];
  const missing=refs.filter(x=>!sourceMap.has(x));
  if(missing.length)add('unresolved-dependency',id,'Unknown source IDs: '+missing.join(', '),'review','Resolve source references',missing);
  const evidence=refs.map(x=>sourceMap.get(x)).filter(Boolean);
  const verifiedEvidence=evidence.some(x=>x.status==='verified'&&x.evidenceRef);
  if(c.failureEvidenceRef){
   add('engineering-failure',id,'Reviewer-reported failed requirement; supporting evidence: '+clean(c.failureEvidenceRef),'critical','Independent engineering review and authorized disposition',refs);
  }else if(!verifiedEvidence){
   add('unsupported-technical-claim',id,'No verified, cited source supports claim: '+clean(c.description),'review','Supply calculation, test or controlling record',refs);
  }
 }
 for(const g of gates){
  const id=clean(g.id);if(!id||gateMap.has(id))throw Error('Gate IDs must be unique and nonempty');
  gateMap.set(id,{id,dependsOn:Array.isArray(g.dependsOn)?g.dependsOn.map(x=>clean(x)):[],evidenceRefs:Array.isArray(g.evidenceRefs)?g.evidenceRefs.map(x=>clean(x)):[],approved:g.approved===true});
 }
 for(const g of gateMap.values()){
  const unknown=g.dependsOn.filter(x=>!gateMap.has(x));
  const missing=g.evidenceRefs.filter(x=>!sourceMap.has(x)||sourceMap.get(x).status!=='verified'||!sourceMap.get(x).evidenceRef);
  if(unknown.length||missing.length)add('unresolved-dependency',g.id,'Gate dependencies/evidence unresolved: '+[...unknown,...missing].join(', '),'review','Resolve source evidence and gate references before release',[...unknown,...missing]);
 }
 const visiting=new Set(),visited=new Set();
 function walk(id,path){if(visiting.has(id)){add('unresolved-dependency',id,'Gate dependency cycle: '+[...path,id].join(' -> '),'high','Break cyclic gate prerequisites',path);return;}if(visited.has(id))return;visiting.add(id);for(const dep of gateMap.get(id).dependsOn)if(gateMap.has(dep))walk(dep,[...path,id]);visiting.delete(id);visited.add(id);}
 for(const id of gateMap.keys())walk(id,[]);
 return {schema:'shane.detangler.source-audit',version:1,status:'Evidence classification only; no access, engineering approval or changes performed',sourceCount:sourceMap.size,claimCount:claims.length,gateCount:gateMap.size,findings,releaseApproved:false,security:{networkAccess:false,changesApplied:false,sourceContentExported:false}};
}
function discrepancyCSV(report){
 const cols=['id','kind','reference','detail','severity','disposition','dependencies','verified','releaseApproved'];
 const cell=x=>{let v=String(x??'');if(/^[=+@-]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"';};
 return [cols.join(','),...report.findings.map(f=>cols.map(k=>cell(Array.isArray(f[k])?f[k].join('; '):f[k])).join(','))].join('\n');
}
return Object.freeze({analyze,toText,auditSources,discrepancyCSV,sourceStatuses,discrepancyKinds,rules:rules.map(({id,title})=>({id,title}))});
});