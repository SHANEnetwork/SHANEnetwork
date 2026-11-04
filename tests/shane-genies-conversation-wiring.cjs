const fs=require("node:fs"),assert=require("node:assert/strict");
const page=fs.readFileSync(require("node:path").join(__dirname,"..","builder.html"),"utf8");
assert(page.includes('<script src="shane-genies-engine.js" defer></script>'));
assert(page.includes('window.SHANEGenies'));
assert(page.includes('shane:genies-analysis'));
assert(page.includes('guidance-submitted-not-verified'));
assert(page.includes('Optional SHANE Genies analysis unavailable; continuing original creation request'));
assert(page.includes('generate.click()'));
console.log("Genies conversational wiring checks passed");