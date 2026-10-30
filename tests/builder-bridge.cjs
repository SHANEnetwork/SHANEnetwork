const assert=require("node:assert/strict");const fs=require("node:fs");const path=require("node:path");const root=path.resolve(__dirname,"..");const builder=fs.readFileSync(path.join(root,"builder.html"),"utf8");const bridge=fs.readFileSync(path.join(root,"shane-builder-bridge.js"),"utf8");assert.ok(builder.includes('<script src="shane-composition.js"></script>'));assert.ok(builder.includes('<script src="shane-builder-bridge.js"></script>'));assert.ok(builder.includes('<script src="shane-vision.js"></script>'));assert.ok(builder.includes('<script src="shane-conversation-sync.js"></script>'));assert.ok(builder.includes("shane:conversation-restore"));assert.ok(builder.includes("shane:conversation-export"));assert.ok(bridge.includes("window.SHANEVision?.interpret(text)"));assert.ok(bridge.includes('action.addEventListener("click"'));assert.ok(bridge.includes("not private services created for your endeavor"));for(const id of ["shaneModuleCommunity","shaneModuleConversation","shaneModuleEvents","shaneModuleDiscovery"])assert.ok(builder.includes('id="'+id+'"'));console.log("PASS builder bridge script references, existing controls, and honest capability status");
assert.ok(builder.includes("submit(idea)"),"Primary vision button must invoke actual AI generation");
assert.ok(!builder.includes("history=[];draftReady=false;render();persist();submit(idea)"),"Vision generation must not clear existing conversation first");
assert.ok(!builder.includes("Your idea has been sent to SHANE AI."),"Do not claim submission without generating");

assert.ok(builder.includes("shane:editor-export"),"Editor must support exporting generated draft");
assert.ok(builder.includes("shane:editor-restore"),"Editor must support restoring generated draft");
const sync=fs.readFileSync(path.join(root,"shane-conversation-sync.js"),"utf8");
assert.ok(sync.includes('select("id,owner_id,content,status")'),"Resume must fetch owner-verified website");
assert.ok(sync.includes('site.owner_id!==auth.user.id'),"Resume must verify website ownership");
assert.ok(sync.includes('shane:editor-restore'),"Resume must reopen the saved website editor");

assert.ok(sync.includes('shane:ai-generation-finished'),"Successful AI generation should trigger private autosave");
assert.ok(sync.includes('autosaveAfterGeneration()'),"Generation listener must invoke private autosave");
