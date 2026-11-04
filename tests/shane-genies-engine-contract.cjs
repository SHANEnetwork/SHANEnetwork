const assert=require("node:assert/strict");const g=require("../shane-genies-engine.js");
const result=g.evaluate({vision:"Create a community bakery",requirements:["online orders"],strengths:["free messaging"],negatives:["no storefront"],candidates:[{id:"a",name:"Pickup",strengths:["free messaging"],requirementsMet:["online orders"],evidence:["prototype tested"]},{id:"b",name:"Delivery",strengths:["free messaging"],requirementsMet:["online orders"],evidence:["prototype tested"]}]});
assert.equal(result.ideas.length,3);assert.equal(result.negativeFlips.length,1);assert.equal(result.merges.length,1);assert.equal(result.fifthCompass.purpose.includes("missed"),true);assert.equal(result.genari.preserveOriginal,true);
assert.equal(g.RULES.optimizer.length,8);assert.equal(g.RULES.harmonizer.length,8);assert.equal(g.RULES.compasses.length,5);
assert.equal(result.merges[0].candidate.provisional,true);
assert.equal(g.evaluate({vision:"hello"}).mirrorCat.warnings.some(x=>x.includes("No real candidates")),true);
assert.equal(g.evaluate({vision:"x",requirements:["must work"],candidates:[{name:"A"}]}).reviews[0].findings.some(x=>x.type==="unverified-requirement"),true);
console.log("SHANE Genies contract tests passed");
