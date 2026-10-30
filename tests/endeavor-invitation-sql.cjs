const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const sql=fs.readFileSync(path.join(__dirname,"../database/shane-endeavor-invitation-response-draft.sql"),"utf8");
test("Invitation response requires authentication",()=>{
 assert.match(sql,/auth\.uid\(\)/);
});
test("Only the invitee's pending row may transition",()=>{
 assert.match(sql,/user_id=\(select auth\.uid\(\)\) and status='invited'/);
});
test("Invitation response cannot change roles or ownership",()=>{
 assert.doesNotMatch(sql,/set\s+role\s*=/i);
 assert.doesNotMatch(sql,/set\s+owner_id\s*=/i);
});
test("Public and anonymous execution are revoked",()=>{
 assert.match(sql,/revoke all on function/);
 assert.match(sql,/to authenticated/);
});
test("Invitation response rejects missing decisions",()=>{
 assert.match(sql,/p_endeavor_id is null or p_accept is null/);
});
