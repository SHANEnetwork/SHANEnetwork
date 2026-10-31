const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const builder=fs.readFileSync(require("node:path").join(__dirname,"../builder.html"),"utf8");
const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
const bridge=fs.readFileSync(require("node:path").join(__dirname,"../shane-creator-network-bridge.js"),"utf8");
test("Creator loads orchestration before its connected-view handler",()=>{
 assert.ok(builder.includes('src="shane-endeavor-orchestrator.js"'));
 assert.ok(builder.indexOf('src="shane-endeavor-orchestrator.js"')<builder.indexOf('src="shane-conversation-sync.js"'));
});
test("Creator receives network readiness notifications",()=>{
 assert.ok(bridge.includes('shane:network-draft-ready'));
 assert.ok(sync.includes('shane:network-draft-ready'));
 assert.ok(sync.includes('SHANEEndeavorOrchestrator?.inspect(saved,listing)'));
});
test("Network draft bridge does not publish automatically",()=>{
 assert.ok(bridge.includes("upsertEndeavorDraft"));
 assert.ok(!bridge.includes(".publish("));
});
test("Connected endeavor requests use a generation guard",()=>{
 assert.ok(sync.includes("connectedViewVersion"));
});
test("Connected view checks selected endeavor before rendering",()=>{
 assert.ok(sync.includes("id!==sessionStorage.getItem(key)"));
});
test("Superseded connected view errors are ignored",()=>{
 assert.ok(sync.includes("if(version===connectedViewVersion)status("));
});
test("Orchestration receives persisted endeavor from owner-scoped store",()=>{
 const store=fs.readFileSync(require("node:path").join(__dirname,"../shane-endeavor-store.js"),"utf8");
 assert.ok(store.includes("linkedOrganizationId:spec.shaneOrganizationId"));
 assert.ok(store.includes("linkedSiteId:data.linked_site_id"));
});
test("Network readiness event only refreshes selected endeavor",()=>{
 assert.ok(sync.includes("event.detail?.endeavorId===sessionStorage.getItem(key)"));
});

const dashboard=fs.readFileSync(require("node:path").join(__dirname,"../dashboard.html"),"utf8");
test("Dashboard integrates member network presence without changing publication",()=>{
 assert.ok(dashboard.includes('id="myNetworkListings"'));
 assert.ok(dashboard.includes('"shane_listings","id,title,status,created_at","owner_id"'));
 assert.ok(dashboard.includes('query(table,cols,field,user.id'));
 assert.ok(dashboard.includes('x.status==="published"?"Public network presence":"Private network draft"'));
 assert.ok(!dashboard.includes('.update({status:"published"'));
});
test("Dashboard maintains vision-first journey and original artwork",()=>{
 assert.ok(dashboard.includes('SHANE-journey-original.png'));
 assert.ok(dashboard.includes('href="#launchpad"'));
 assert.ok(dashboard.includes('builder.html#vision-first'));
 assert.ok(!dashboard.includes('builder.html#endeavor-assessment'));
 assert.ok(!dashboard.includes('maxlength="2000"'));
});

test("Dashboard hands vision to Creator through guarded one-time transfer",()=>{
 const handoff=fs.readFileSync(require("node:path").join(__dirname,"../shane-vision-handoff.js"),"utf8");
 assert.ok(dashboard.includes('sessionStorage.setItem("shane_network_vision_handoff_v1"'));
 assert.ok(dashboard.includes('JSON.stringify({vision:goal,created:Date.now()})'));
 assert.ok(handoff.includes('const key="shane_network_vision_handoff_v1"'));
 assert.ok(handoff.includes('if(occupied&&!alreadyPresent)'));
 assert.ok(handoff.includes('sessionStorage.removeItem(key)'));
});
