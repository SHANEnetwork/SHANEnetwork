/* Run: node tests/shane-ai-revision-contract.cjs
   Static regression contract: this does not establish live functional correctness. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const source=fs.readFileSync(require.resolve("../shane-conversation-store.js"),"utf8");
const mustContain=[
 "async function reasonAndCreate(",
 "async function reviseSavedCreation(",
 "async function pendingRevisionVerification(",
 "async function proposeRevisionCorrections(",
 "async function applyReviewedCorrection(",
 "async function verifySavedRevisionPersistence(",
 'purpose:"revise-saved-creation"',
 'kind:"creation-revision-outcome"',
 'kinds:["creation-revision-outcome","creation-revision-verification"]',
 "verifiedFunctionality:false",
 "functionalityVerified:false",
 "if(approved!==true)",
 "if(!issue||issue.status!==\"functional-verification-required\")",
 'db.from("shane_site_versions")',
 "creationId,revisionId"
];
for(const token of mustContain){
 assert.ok(source.includes(token),"Missing revision lifecycle contract: "+token);
}
const exportLine=source.split("\n").find(line=>line.startsWith("window.SHANEConversationStore=Object.freeze("));
assert.ok(exportLine,"SHANE store API not exported");
for(const name of ["pendingRevisionVerification","proposeRevisionCorrections","applyReviewedCorrection","verifySavedRevisionPersistence"]){
 assert.ok(exportLine.includes(name),"Missing public revision API: "+name);
}
assert.ok(!source.includes("fullyVerified:pending.length===0"),"An empty queue must not imply success");
console.log("SHANE AI revision lifecycle static contract passed; live verification remains required.");
