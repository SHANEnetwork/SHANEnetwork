const assert=require("node:assert/strict");
const genies=require("../shane-genies-engine.js");
const vision={vision:"Create a community bakery",requirements:["Keep existing website","Allow collaboration"],strengths:["Existing members"],negatives:["No storefront"],candidates:[
{id:"a",name:"Pop-up",requirementsMet:["Keep existing website"],strengths:["Existing members"],weaknesses:["Limited hours"],evidence:["Prior pop-up schedule"]},
{id:"b",name:"Shared kitchen",requirementsMet:["Allow collaboration"],strengths:["Existing members"],weaknesses:["Kitchen availability"],evidence:[]}
]};
const result=genies.evolve(vision,{rounds:3});
assert.equal(result.rules.optimizer[0],"never-degrade");
assert.equal(result.rules.harmonizer[1],"double-harmonizer");
assert.equal(result.rules.compasses.length,5);
assert.ok(result.rounds.length>=1&&result.rounds.length<=3);
assert.ok(result.rounds[0].reviews.some(x=>x.id==="a"));
assert.ok(result.fifthCompass.questions.length>0);
assert.equal(result.provenance.simulationsRun,0);
assert.equal(result.recommendation.status,"provisional-ranking-not-proof");
assert.ok(result.candidates.some(x=>x.candidate.origin==="harmonizer-hypothesis"));
assert.equal(genies.evolve({...vision,candidates:[]}).stoppingReason,"No concrete candidates; external creative generation is required.");
assert.ok(genies.evolve(vision,{rounds:100}).rounds.length<=5);
console.log("Genies bounded evolution contract passed");
