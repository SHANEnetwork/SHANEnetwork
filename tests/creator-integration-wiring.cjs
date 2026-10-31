const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const builder=fs.readFileSync(require("node:path").join(__dirname,"../builder.html"),"utf8");
const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
const bridge=fs.readFileSync(require("node:path").join(__dirname,"../shane-creator-network-bridge.js"),"utf8");
test("Creator loads orchestration before its connected-view handler",()=>{
 assert.ok(builder.includes('src="shane-endeavor-orchestrator.js"'));
 assert.ok(builder.indexOf('src="shane-endeavor-orchestrator.js"')<builder.indexOf('src="shane-conversation-sync.js"'));
});
test("Creator receives network readiness notifications",()=>{
 assert.ok(bridge.includes('shane:network-draft-ready'));
 assert.ok(sync.includes('shane:network-draft-ready'));
 assert.ok(sync.includes('SHANEEndeavorOrchestrator?.inspect(saved,listing)'));
});
test("Network draft bridge does not publish automatically",()=>{
 assert.ok(bridge.includes("upsertEndeavorDraft"));
 assert.ok(!bridge.includes(".publish("));
});
test("Connected endeavor requests use a generation guard",()=>{
 assert.ok(sync.includes("connectedViewVersion"));
});
test("Connected view checks selected endeavor before rendering",()=>{
 assert.ok(sync.includes("id!==sessionStorage.getItem(key)"));
});
test("Superseded connected view errors are ignored",()=>{
 assert.ok(sync.includes("if(version===connectedViewVersion)status("));
});
test("Orchestration receives persisted endeavor from owner-scoped store",()=>{
 const store=fs.readFileSync(require("node:path").join(__dirname,"../shane-endeavor-store.js"),"utf8");
 assert.ok(store.includes("linkedOrganizationId:spec.shaneOrganizationId"));
 assert.ok(store.includes("linkedSiteId:data.linked_site_id"));
});
test("Network readiness event only refreshes selected endeavor",()=>{
 assert.ok(sync.includes("event.detail?.endeavorId===sessionStorage.getItem(key)"));
});

const dashboard=fs.readFileSync(require("node:path").join(__dirname,"../dashboard.html"),"utf8");
test("Dashboard integrates member network presence without changing publication",()=>{
 assert.ok(dashboard.includes('id="myNetworkListings"'));
 assert.ok(dashboard.includes('"shane_listings","id,title,status,created_at","owner_id"'));
 assert.ok(dashboard.includes('query(table,cols,field,user.id'));
 assert.ok(dashboard.includes('x.status==="published"?"Public network presence":"Private network draft"'));
 assert.ok(!dashboard.includes('.update({status:"published"'));
});
test("Dashboard maintains vision-first journey and original artwork",()=>{
 assert.ok(dashboard.includes('SHANE-journey-original.png'));
 assert.ok(dashboard.includes('href="#launchpad"'));
 assert.ok(dashboard.includes('builder.html#vision-first'));
 assert.ok(!dashboard.includes('builder.html#endeavor-assessment'));
 assert.ok(!dashboard.includes('maxlength="2000"'));
});

test("Dashboard hands vision to Creator through guarded one-time transfer",()=>{
 const handoff=fs.readFileSync(require("node:path").join(__dirname,"../shane-vision-handoff.js"),"utf8");
 assert.ok(dashboard.includes('sessionStorage.setItem("shane_network_vision_handoff_v1"'));
 assert.ok(dashboard.includes('JSON.stringify({vision:goal,created:Date.now()})'));
 assert.ok(!dashboard.includes('sessionStorage.setItem("shane_welcome_draft",goal)'));
 assert.ok(handoff.includes('const key="shane_network_vision_handoff_v1"'));
 assert.ok(handoff.includes('if(occupied&&!alreadyPresent)'));
 assert.ok(handoff.includes('sessionStorage.removeItem(key)'));
});

test("Creator receives incoming vision once and triggers draft synchronization",()=>{
 const handoff=fs.readFileSync(require("node:path").join(__dirname,"../shane-vision-handoff.js"),"utf8");
 assert.ok(handoff.includes('const destination=prompt||reply'));
 assert.ok(handoff.includes('destination.dispatchEvent(new Event("input",{bubbles:true}))'));
 assert.ok(!handoff.includes('if(reply&&!reply.value.trim())reply.value=vision'));
});

test("Waiting vision can be resumed only after current writing is cleared",()=>{
 const handoff=fs.readFileSync(require("node:path").join(__dirname,"../shane-vision-handoff.js"),"utf8");
 assert.ok(handoff.includes('id="shaneBringWaitingVision"'));
 assert.ok(handoff.includes('button.onclick=()=>'));
 assert.ok(handoff.includes('if((prompt&&prompt.value.trim())||(reply&&reply.value.trim()))'));
 assert.ok(handoff.includes('button.remove();apply()'));
});

test("Dashboard continues endeavors collaborations and network drafts independently",()=>{
 assert.ok(dashboard.includes('sb.from("shane_endeavors").select("id,title,idea,updated_at").eq("owner_id",user.id)'));
 assert.ok(dashboard.includes('sb.from("shane_listings").select("id,title,status,created_at").eq("owner_id",user.id)'));
 assert.ok(dashboard.includes('Promise.allSettled(queries)'));
 assert.ok(dashboard.includes('Continue your private network draft: '));
 assert.ok(dashboard.includes('workspace.html?collaboration='));
});

test("Network draft preparation survives an optional website provisioning failure",()=>{
 const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
 assert.ok(sync.includes('siteId:null,organizationId:null'));
 assert.ok(sync.includes('An optional website provisioning failure must not block the independent network draft.'));
 assert.ok(bridge.includes('document.addEventListener("shane:endeavor-saved"'));
 assert.ok(!bridge.includes('.publish('));
});

test("Partially provisioned endeavor remains the active saved conversation",()=>{
 const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
 const failure=sync.slice(sync.indexOf('}catch(siteError){'),sync.indexOf('}catch(e){status("Conversation not saved:'));
 assert.ok(failure.includes('siteId:null,organizationId:null'));
 assert.ok(failure.includes('return true;'));
 assert.ok(!failure.includes('return false;'));
 assert.ok(sync.includes('if(!saved){'));
});

test("Switching saved endeavors does not change identity before consent",()=>{
 const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
 assert.ok(sync.includes('async function resume(requestedId)'));
 assert.ok(sync.includes('button.addEventListener("click",()=>resume(item.id))'));
 assert.ok(!sync.includes('sessionStorage.setItem(key,item.id);resume()'));
 const resume=sync.slice(sync.indexOf('async function resume(requestedId)'),sync.indexOf('async function analystContext()'));
 assert.ok(resume.indexOf('if(current?.turns?.length&&!confirm(')<resume.indexOf('sessionStorage.setItem(key,id)'));
});

test("Dashboard endeavor links restore the requested conversation safely",()=>{
 const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
 assert.ok(sync.includes('new URLSearchParams(location.search).get("endeavor")'));
 assert.ok(sync.includes('resume(requested)'));
 assert.ok(sync.includes('window.addEventListener("shane:client-ready"'));
 assert.ok(sync.includes('This endeavor link is invalid. Your existing conversation has not been changed.'));
 assert.ok(dashboard.includes('builder.html?endeavor='));
});

test("Connected endeavor exposes conversation discovery and collaboration routes",()=>{
 const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
 assert.ok(sync.includes('builder.html?endeavor="+encodeURIComponent(saved.id)'));
 assert.ok(sync.includes('["Discover people and opportunities","network.html?endeavor="+encodeURIComponent(saved.id)]'));
 assert.ok(sync.includes('["Collaborations and private messages","members.html?endeavor="+encodeURIComponent(saved.id)+"#collaborationSection"]'));
 assert.ok(sync.includes('serviceList.className="shane-service-readiness"'));
});

test("Connected endeavor ignores stale asynchronous project results",()=>{
 const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
 const connected=sync.slice(sync.indexOf('async function openConnectedEndeavor(){'));
 const firstCheck=connected.indexOf('if(version!==connectedViewVersion||id!==sessionStorage.getItem(key))return;');
 assert.ok(firstCheck>connected.indexOf('await window.SHANEEndeavorStore.load(client,id)'));
 assert.ok(firstCheck<connected.indexOf('details.replaceChildren()'));
 assert.ok(connected.indexOf('if(version!==connectedViewVersion||id!==sessionStorage.getItem(key))return;',firstCheck+1)>firstCheck);
});

test("Creator network presence uses shared visual language without changing private publish policy",()=>{
 const bridgeSource=fs.readFileSync(require("node:path").join(__dirname,"../shane-creator-network-bridge.js"),"utf8");
 const visual=fs.readFileSync(require("node:path").join(__dirname,"../shane-visual-world.css"),"utf8");
 assert.ok(bridgeSource.includes('panel.className="shane-network-presence-panel"'));
 assert.ok(visual.includes('.shane-network-presence-panel'));
 assert.ok(visual.includes('prefers-reduced-motion'));
 assert.ok(bridgeSource.includes('api.upsertEndeavorDraft'));
 assert.ok(!bridgeSource.includes('api.publish('));
});

test("Network bridge does not show another endeavor's completed listing",()=>{
 const bridgeSource=fs.readFileSync(require("node:path").join(__dirname,"../shane-creator-network-bridge.js"),"utf8");
 assert.ok(bridgeSource.includes('let latestEndeavorId=null'));
 assert.ok(bridgeSource.includes('if(!isCurrent(id))return;'));
 assert.ok(bridgeSource.includes('document.addEventListener("shane:endeavor-resumed"'));
 assert.ok(bridgeSource.includes('link.hidden=true'));
 assert.ok(bridgeSource.includes('if(isCurrent(id))status.textContent='));
});

test("Resuming an endeavor restores only its owner-scoped existing network presence",()=>{
 const bridgeSource=fs.readFileSync(require("node:path").join(__dirname,"../shane-creator-network-bridge.js"),"utf8");
 const restore=bridgeSource.slice(bridgeSource.indexOf('async function restorePresence(id)'));
 assert.ok(restore.includes('await client.auth.getUser()'));
 assert.ok(restore.includes('.eq("endeavor_id",id).eq("owner_id",auth.user.id).maybeSingle()'));
 assert.ok(restore.includes('if(!isCurrent(id))return'));
 assert.ok(restore.includes('link.hidden=false'));
 assert.ok(!restore.includes('.insert('));
 assert.ok(!restore.includes('.publish('));
});

test("Connected endeavor journey uses shared responsive visual system",()=>{
 const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
 const visual=fs.readFileSync(require("node:path").join(__dirname,"../shane-visual-world.css"),"utf8");
 assert.ok(sync.includes('journey.className="shane-endeavor-journey"'));
 assert.ok(visual.includes('#shaneConnectedDetails:not(:empty)'));
 assert.ok(visual.includes('#shaneConnectedDetails .shane-service-readiness'));
 assert.ok(visual.includes('grid-template-columns:repeat(auto-fit'));
 assert.ok(sync.includes('["Collaborations and private messages","members.html?endeavor="+encodeURIComponent(saved.id)+"#collaborationSection"]'));
});

test("Creator displays only accepted collaborations for the active owned endeavor",()=>{
 const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
 assert.ok(sync.includes('.eq("listing_id",listing.id).in("status",["pending","accepted"]).limit(25)'));
 assert.ok(sync.includes('collaboration.sender_id!==auth.user.id&&collaboration.recipient_id!==auth.user.id'));
 assert.ok(sync.includes('members.html?endeavor="+encodeURIComponent(saved.id)+"&conversation="+encodeURIComponent(collaboration.id)'));
 assert.ok(sync.includes('if(version!==connectedViewVersion||id!==sessionStorage.getItem(key))return;'));
});

test("Creator distinguishes pending requests from accepted private collaborations",()=>{
 const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
 assert.ok(sync.includes('collaboration.status==="accepted"?"Continue private collaboration":"Review pending collaboration request"'));
 assert.ok(sync.includes('heading.textContent="People connecting around this endeavor"'));
});

test("Endeavor context survives navigation into collaboration and back to Creator",()=>{
 const sync=fs.readFileSync(require("node:path").join(__dirname,"../shane-conversation-sync.js"),"utf8");
 const members=fs.readFileSync(require("node:path").join(__dirname,"../members.html"),"utf8");
 assert.ok(sync.includes('"network.html?endeavor="+encodeURIComponent(saved.id)'));
 assert.ok(sync.includes('"members.html?endeavor="+encodeURIComponent(saved.id)+"&conversation="+encodeURIComponent(collaboration.id)'));
 assert.ok(members.includes('journeyEndeavor=new URLSearchParams(location.search).get("endeavor")'));
 assert.ok(members.includes('back.href="builder.html?endeavor="+encodeURIComponent(journeyEndeavor)+"#vision-first"'));
 assert.ok(members.includes('shane-return-journey'));
});

test("Network discovery preserves the active Creator endeavor across searches",()=>{
 const network=fs.readFileSync(require("node:path").join(__dirname,"../network.html"),"utf8");
 assert.ok(network.includes('validCreatorEndeavor'));
 assert.ok(network.includes('params.set("endeavor",validCreatorEndeavor)'));
 assert.ok(network.includes('back.href="builder.html?endeavor="+encodeURIComponent(validCreatorEndeavor)+"#vision-first"'));
 assert.ok(network.includes('shane-discovery-return'));
});

test("Network introductions preserve Creator context through sign-in and existing invitations",()=>{
 const network=fs.readFileSync(require("node:path").join(__dirname,"../network.html"),"utf8");
 assert.ok(network.includes('a.href="members.html?listing="+encodeURIComponent(item.id)+(validCreatorEndeavor?'));
 assert.ok(network.includes('link.href="members.html?conversation="+encodeURIComponent(previous.id)+(validCreatorEndeavor?'));
 assert.ok(network.includes('"#collaborationSection"'));
});
