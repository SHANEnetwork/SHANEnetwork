/* Run with: node tests/shane-vortex-recall-contract.cjs */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const window={};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..","shane-vortex-recall.js"),"utf8"),{window});
const engine=window.SHANEVortexRecall;
const chapters=[
 {number:1,turns:[{turn_number:19,role:"you",body:"We planned an online bakery",created_at:"2026-01-01"},{turn_number:20,role:"shane",body:"Online bakery draft created",created_at:"2026-01-02"}]},
 {number:2,turns:[{turn_number:21,role:"you",body:"Now focus on wedding cakes",created_at:"2026-02-01"},{turn_number:22,role:"shane",body:"Wedding cake website revised",created_at:"2026-02-02"}]}
];
const graph=engine.build(chapters);
assert.equal(graph.nodes.length,4);
assert.ok(graph.links.get("turn:20").some(x=>x.id==="turn:21"&&x.type==="sequence"),"Temporal continuity must survive chapter rollover");
const matches=engine.recall(graph,"wedding cakes");
assert.equal(matches[0].turnNumber,21);
assert.equal(matches[0].source?.turnNumber,21);
assert.equal(matches[0].source?.chapter,2);
assert.equal(engine.recall(graph,"")[0],undefined);
assert.throws(()=>engine.build([{number:1,turns:[chapters[0].turns[0],chapters[0].turns[0]]}]),/Duplicate archived turn/);
console.log("Vortex recall contract passed");
