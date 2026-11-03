/* Run: node tests/shane-endeavor-core-contract.cjs
   Offline contract tests for SHANE's shared endeavor and plugin foundation. */
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const listeners={},storage=new Map(),events=[];
const document={addEventListener:(n,fn)=>{(listeners[n]??=[]).push(fn)},dispatchEvent:e=>{events.push(e);for(const fn of listeners[e.type]||[])fn(e)}};
class CustomEvent{constructor(type,options){this.type=type;this.detail=options.detail}}
const window={};
const context={window,document,CustomEvent,sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},Date,console};
vm.runInNewContext(fs.readFileSync("shane-endeavor-core.js","utf8"),context);
const core=window.SHANEEndeavorCore;assert.ok(core);
let calls=0;
core.register({id:"site.preview",permission:"read",description:"Preview a draft",run:async({context})=>{calls++;return context.id}});
core.register({id:"site.publish",permission:"explicit-action",run:async()=>{calls++;return "published"}});
assert.equal(core.list().length,2);
(async()=>{
 assert.equal(await core.invoke("site.preview"),null);
 await assert.rejects(()=>core.invoke("site.publish"),/approval/i);
 assert.equal(calls,1,"Publishing cannot run without explicit approval");
 assert.equal(await core.invoke("site.publish",null,{userApproved:true}),"published");
 assert.equal(calls,2);
 assert.throws(()=>core.register({id:"site.publish",run:()=>{}}),/already registered/i);
 assert.throws(()=>core.register({id:"bad id",run:()=>{}}),/invalid/i);
 const destination=core.handoff("I want to build a local community bakery with collaborators.","test");
 assert.equal(destination,"builder.html#vision-first");
 assert.equal(core.snapshot().id,null);
 assert.equal(JSON.parse(storage.get("shane-creative-handoff-v1")).text,"I want to build a local community bakery with collaborators.");
 assert.equal(JSON.parse(storage.get("shane-intent-handoff-v1")).visibility,"private");
 document.dispatchEvent(new CustomEvent("shane:endeavor-changed",{detail:{id:"a00b1234-1111-4222-8333-123456789abc",reason:"saved"}}));
 assert.equal(core.snapshot().id,"a00b1234-1111-4222-8333-123456789abc");
 assert.ok(events.some(e=>e.type==="shane:shared-endeavor-context"));
 console.log("SHANE endeavor core contract passed");
})().catch(error=>{console.error(error);process.exitCode=1});
