const test=require("node:test");
const assert=require("node:assert/strict");
const {inspect}=require("../shane-endeavor-diagnostics.js");
const id="11111111-1111-4111-8111-111111111111";
test("valid persisted endeavor passes structural inspection",()=>{
 const report=inspect({id,persisted:true,spec:{title:"Research society"},conversation:[]});
 assert.equal(report.ok,true);
 assert.equal(report.scope,"local-structure-only");
 assert.deepEqual(report.findings,[]);
});
test("invalid linked site is flagged without altering original",()=>{
 const input={id,persisted:true,linkedSiteId:"broken",conversation:[]};
 const report=inspect(input);
 assert.equal(report.ok,false);
 assert.equal(report.findings[0].code,"invalid-site-link");
 assert.equal(input.linkedSiteId,"broken");
});
test("missing history is a warning, not a fabricated service failure",()=>{
 const report=inspect({id,persisted:true});
 assert.equal(report.ok,true);
 assert.ok(report.findings.some(x=>x.code==="missing-conversation"));
});
test("missing endeavor fails safely",()=>{
 const report=inspect(null);
 assert.equal(report.ok,false);
 assert.equal(report.findings[0].code,"missing-endeavor");
});
