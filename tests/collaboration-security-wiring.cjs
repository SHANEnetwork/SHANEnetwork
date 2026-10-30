const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const sql=fs.readFileSync(path.join(__dirname,"../database/shane-collaboration-hardening.sql"),"utf8");
const workspace=fs.readFileSync(path.join(__dirname,"../workspace.html"),"utf8");
const inbox=fs.readFileSync(path.join(__dirname,"../shane-network-collaborations.js"),"utf8");
test("database restricts collaboration responses to pending invitations",()=>{
 assert.match(sql,/old\.status\s*<>\s*'pending'/);
 assert.match(sql,/new\.status\s+not\s+in\s*\('accepted','declined'\)/);
 assert.match(sql,/before update on public\.shane_collaboration_requests/);
});
test("workspace identity columns are excluded from authenticated updates",()=>{
 assert.match(sql,/revoke update on public\.shane_collaboration_tasks from authenticated/);
 assert.match(sql,/grant update \(assignee_id, title, details, due_date, completed\)/);
 assert.match(sql,/revoke update on public\.shane_collaboration_overviews from authenticated/);
 assert.match(sql,/grant update \(purpose, next_step, updated_by, updated_at\)/);
 assert.match(sql,/creator_id\s*=\s*\(select auth\.uid\(\)\)/);
});
test("accepted collaboration connects inbox, workspace, and private messages",()=>{
 assert.match(inbox,/workspace\.html\?collaboration=/);
 assert.match(inbox,/shane_collaboration_messages/);
 assert.match(workspace,/r\.status!=="accepted"/);
 assert.match(workspace,/\[r\.sender_id,r\.recipient_id\]\.includes\(user\.id\)/);
 assert.match(workspace,/shane_collaboration_tasks/);
 assert.match(workspace,/shane_collaboration_overviews/);
});
