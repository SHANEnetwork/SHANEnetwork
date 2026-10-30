const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../shane-invitation-inbox.js"),"utf8");
test("Invitation inbox ignores superseded refresh results",()=>{
 assert.match(source,/refreshVersion/);
 assert.match(source,/if\(version!==refreshVersion\)return/);
});
test("Submission errors cannot replace a newer refresh status",()=>{
 assert.match(source,/if\(version===refreshVersion\)status\.textContent=error\.message/);
});
test("Invitation decisions require button clicks",()=>{
 assert.match(source,/addEventListener\("click"/);
 assert.match(source,/SHANEInvitations\.respond/);
});
