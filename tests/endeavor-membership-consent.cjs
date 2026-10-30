const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const sql=fs.readFileSync(path.join(__dirname,"../database/shane-endeavor-collaboration-draft.sql"),"utf8");
test("Membership status cannot be changed by direct client update",()=>{
 assert.match(sql,/grant update \(role\) on public\.shane_endeavor_members to authenticated/i);
 assert.doesNotMatch(sql,/grant update \(role,status\)/i);
});
test("Invitation creation is owner-scoped and pending",()=>{
 assert.match(sql,/status='invited'/);
 assert.match(sql,/e\.owner_id=\(select auth\.uid\(\)\)/);
});
