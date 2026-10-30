const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const sql=fs.readFileSync(path.join(__dirname,"../database/shane-endeavor-revocation-draft.sql"),"utf8");
test("Revocation is an authenticated, narrowly exposed server operation",()=>{
 assert.match(sql,/security definer set search_path = ''/i);
 assert.match(sql,/auth\.uid\(\)/i);
 assert.match(sql,/revoke all on function public\.shane_revoke_endeavor_member\(uuid,uuid\) from public, anon/i);
 assert.match(sql,/grant execute on function public\.shane_revoke_endeavor_member\(uuid,uuid\) to authenticated/i);
});
test("Only endeavor owner can revoke a different member",()=>{
 assert.match(sql,/e\.owner_id\s*=\s*\(select auth\.uid\(\)\)/i);
 assert.match(sql,/p_user_id\s*=\s*\(select auth\.uid\(\)\)/i);
 assert.match(sql,/where endeavor_id\s*=\s*p_endeavor_id and user_id\s*=\s*p_user_id/i);
});
test("Revocation cannot activate or change roles",()=>{
 assert.match(sql,/set status\s*=\s*'revoked'/i);
 assert.match(sql,/status in \('invited','active'\)/i);
 assert.doesNotMatch(sql,/set\s+role\s*=/i);
 assert.doesNotMatch(sql,/set\s+owner_id\s*=/i);
});
