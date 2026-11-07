// Deterministic, read-only mapping from SHANE's strict acceptance ledger to
// Detangler's dependency audit. No credentials, network requests, or gate PASS claims.
const fs=require('node:fs');
const path=require('node:path');
const {auditSources,discrepancyCSV}=require('../shane-detangler-core.js');
const ledger=fs.readFileSync(path.join(__dirname,'../docs/endeavor-journey-acceptance-ledger.md'),'utf8');
const ids=[...ledger.matchAll(/^\| (EJ-\d{2}) \|/gm)].map(x=>x[1]);
if(ids.length!==12||new Set(ids).size!==12)throw Error('Expected exactly 12 unique EJ gates');
const nav=[...ledger.matchAll(/\*\*(LINK-\d{2})\*\*:/g)].map(x=>x[1]);
if(nav.length!==4||new Set(nav).size!==4)throw Error('Expected exactly four navigation gates');
const sources=[
 {id:'live-account',title:'Dedicated signed-in deployed browser run',status:'missing-documentation'},
 {id:'two-account',title:'Two-account collaboration browser evidence',status:'missing-documentation'},
 {id:'deployed-navigation',title:'Deployed public navigation run',status:'missing-documentation'},
 {id:'account-navigation',title:'Authenticated dashboard and saved endeavor navigation',status:'missing-documentation'}
];
const dependsOn={
 'EJ-02':['EJ-01'],'EJ-03':['EJ-02'],'EJ-04':['EJ-02'],'EJ-05':['EJ-04'],
 'EJ-06':['EJ-04'],'EJ-07':['EJ-04'],'EJ-08':['EJ-05','EJ-06','EJ-07'],
 'EJ-09':['EJ-03'],'EJ-10':['EJ-02'],'EJ-11':['EJ-03'],
 'EJ-12':ids.filter(x=>x!=='EJ-12'),
 'LINK-02':['EJ-03'],'LINK-03':['LINK-02'],'LINK-04':['LINK-01']
};
const gates=[...ids,...nav].map(id=>({id,dependsOn:dependsOn[id]||[],
 evidenceRefs:id==='EJ-11'?['two-account']:id==='LINK-01'?['deployed-navigation']:
 id.startsWith('LINK-')?['account-navigation']:['live-account']}));
const report=auditSources({sources,gates});
if(report.gateCount!==16)throw Error('Expected sixteen acceptance dependencies');
const summary={schema:'shane.acceptance.detangler',version:1,verifiedPasses:0,
 scorePolicy:'No gate is passed by this report. Refer to deployed real-account evidence.',
 gateCount:16,dependencyFindings:report.findings.filter(x=>x.kind==='unresolved-dependency').length,
 report};
const format=process.argv.includes('--csv')?'csv':'json';
process.stdout.write(format==='csv'?discrepancyCSV(report)+'\n':JSON.stringify(summary,null,2)+'\n');
