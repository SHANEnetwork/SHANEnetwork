const fs=require("node:fs"),assert=require("node:assert/strict");const html=fs.readFileSync("builder.html","utf8");assert.equal((html.match(/\$\("visionGuide"\)\.addEventListener\("click"/g)||[]).length,1,"Primary action must have one conversation submit handler");assert.equal((html.match(/\$\('visionGuide'\)\.addEventListener\('click',\(\)=>\{const idea=/g)||[]).length,0,"Legacy parallel generation handler must not return");assert.ok(html.includes("submit(idea)"),"Vision should become a conversation message");console.log("PASS single primary conversational generation path");
assert.ok(html.includes("history.slice(0,-1).filter"),"Refinement should retain prior conversation turns");assert.ok(html.includes("Recent conversation context (oldest to newest)"),"AI should receive conversational context");
assert.ok(html.includes('document.addEventListener("shane:ai-generation-finished",event=>{if(/^AI'),"Live canvas should refresh after successful AI generation");
assert.ok(html.includes('.join("\\n").slice(-600)'),"Conversation context must have a bounded prompt size");
assert.ok(html.includes("Tell me what feels right, what you want changed, or what we should explore next."),"SHANE should invite collaborative refinement");
assert.ok(html.includes("finish(status,event.detail?.mode)"),"Creation result should use actual generation mode");
assert.ok(html.includes("promptText.slice(0,availableRequest)"),"AI revision must reserve room for the latest creator request");
assert.ok(html.includes("Different endeavors should have genuinely different visual identities"),"Generator must prioritize distinctive visual identity");
assert.ok(html.includes(".join(\"\\n\").slice(-600)"),"Conversation context must fit the AI prompt budget");
assert.ok(html.includes('t.role==="you"&&typeof t.text==="string"'),"AI context must prioritize actual creator instructions");
assert.ok(html.includes("Existing website summary:"),"AI revisions must carry a focused summary of the existing website");
assert.ok(html.includes("Treat accessibility as part of beautiful design"),"AI generation must include accessibility requirements");
assert.ok(html.includes("Preserve the creator’s specific terminology and identity"),"AI generation must preserve creator voice");
assert.ok(html.includes("latest.slice(0,950)"),"Latest creator request and earlier decisions must both fit within revision context");
assert.ok(html.includes('"shane:conversation-draft-ready"'),"Restored drafts must explicitly synchronize revision mode");
const sync=fs.readFileSync("shane-conversation-sync.js","utf8");assert.ok(sync.includes("const restoredDraft=site.content?.shaneEditorDraft||"),"Resume must support both nested and native editor content");assert.ok(sync.includes('typeof site.content?.pages==="string"'),"Composition placeholder pages must not masquerade as an editable website");
assert.ok(sync.includes("private site foundation, but no editable website draft yet"),"Foundation-only creations must not be described as finished websites");
assert.ok(html.includes('<select id="aiProvider" hidden aria-label="AI service used by SHANE"'),"Creator should not have to select an AI provider");
assert.ok(html.includes('<select id="aiMode" hidden aria-label="SHANE automatically selects creation or refinement"'),"Creator must not manually configure generation mode");
assert.ok(html.includes('<fieldset class="shane-optional-starting-modes" hidden'),"Vision-first flow must not begin with a starting-mode questionnaire");
assert.ok(html.includes("budget-existingSummary.length-changePrefix.length"),"Revision prompt must reserve room for existing website context");
assert.ok(html.includes('if(mode==="new"){const vision='),"Automatic visual identity should apply to new drafts");
assert.ok(html.includes('document.getElementById("layoutStyle").value=chosen.layout'),"SHANE must select layout from creator vision");
assert.ok(html.includes('document.getElementById("brandFont").value=chosen.font'),"SHANE must select typography from creator vision");
assert.ok(html.indexOf("previousAIGeneration={content:getSite()")<html.indexOf('if(mode==="new"){const vision='),"Undo snapshot must precede automatic visual identity changes");
assert.ok(html.indexOf('if(mode==="new"){const vision=')<html.indexOf('if(["modern","friendly","classic","editorial","mono"].includes(site.brandFont))'),"Explicit AI typography must override inferred typography");
assert.ok(html.includes('if(["classic","minimal","bold"].includes(site.layoutStyle))'),"AI-selected layout should be honored when valid");
assert.ok(html.includes("When the generator supports optional design fields, include brandColor"),"AI prompt should request validated visual identity fields");

assert.ok(html.includes('String(site.name||"")+" "+String(site.tagline||"")+" "+String(site.about||"")'),"Network capabilities must consider the creator’s full vision, not only page headings");

assert.ok(html.includes('{role:"shane",text:"Composition updated: "'),"Structured refinement must use the conversation schema's shane role");
assert.ok(!html.includes('{role:"assistant",text:"Composition updated: "'),"Structured refinement must not persist unsupported assistant role");

assert.ok(html.includes("saved.conversation.length>SHANEConversationState.MAX_TURNS-2"),"Two-turn refinement must check remaining conversation capacity before saving");

assert.ok(html.includes("conversation});if(section.dataset.endeavorId!==id)return;"),"Refinement completion must not overwrite another project editor");
assert.ok(html.includes("conversation:saved.conversation});if(section.dataset.endeavorId!==id)return;"),"Title-save completion must not overwrite another project editor");
