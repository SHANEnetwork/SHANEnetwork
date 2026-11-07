const {test}=require('node:test');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const path=require('node:path');
const script=path.join(__dirname,'../scripts/shane-acceptance-detangler.cjs');
test('strict acceptance Detangler maps all 12 endeavor and four navigation gates',()=>{
 const r=JSON.parse(execFileSync(process.execPath,[script],{encoding:'utf8'}));
 assert.equal(r.schema,'shane.acceptance.detangler');
 assert.equal(r.gateCount,16);
 assert.equal(r.verifiedPasses,0);
 assert.equal(r.report.releaseApproved,false);
 assert.equal(r.report.security.networkAccess,false);
 assert.ok(r.dependencyFindings>=16);
});
test('CSV export is a discrepancy register and never marks approval',()=>{
 const csv=execFileSync(process.execPath,[script,'--csv'],{encoding:'utf8'});
 assert.match(csv,/unresolved-dependency/);
 assert.match(csv,/EJ-12/);
 assert.match(csv,/LINK-04/);
});
