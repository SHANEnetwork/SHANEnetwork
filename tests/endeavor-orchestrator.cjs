const test=require("node:test");
const assert=require("node:assert/strict");
const orchestrator=require("../shane-endeavor-orchestrator.js");
const id="11111111-1111-4111-8111-111111111111";
test("unsaved endeavors cannot be represented as ready",()=>assert.throws(()=>orchestrator.inspect({id}),/Saved endeavor/));
test("unlinked services are not presented as working",()=>{
 const s=orchestrator.inspect({id,persisted:true});
 assert.equal(s.endeavor.state,"ready");
 assert.equal(s.website.state,"needs-setup");
 assert.equal(s.network.state,"needs-setup");
 assert.equal(s.commerce.state,"not-activated");
 assert.equal(s.legal.state,"drafting-context-only");
});
test("matching private listing is never called published",()=>{
 const s=orchestrator.inspect({id,persisted:true,linkedSiteId:"site"}, {id:"listing",endeavor_id:id,status:"draft"});
 assert.equal(s.website.state,"linked");
 assert.equal(s.network.state,"private-draft");
});
test("foreign listing is not linked to the endeavor",()=>{
 const s=orchestrator.inspect({id,persisted:true},{id:"listing",endeavor_id:"other",status:"published"});
 assert.equal(s.network.state,"needs-setup");
});
