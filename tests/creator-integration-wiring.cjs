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
