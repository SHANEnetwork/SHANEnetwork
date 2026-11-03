/* Creator bridge for Fractal Memory. Existing conversation remains operational.
   The ledger is additive; failures never delete the current browser/account history. */
(()=>{"use strict";
const queueKey="shane-fractal-pending-v1",statusId="shane-fractal-status";
let pending=[],endeavorId=null,flushing=false,ready=false;
const validId=id=>typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id);
try{const saved=JSON.parse(sessionStorage.getItem(queueKey)||"[]");if(Array.isArray(saved))pending=saved.filter(x=>x&&validId(x.id)&&validId(x.endeavorId)&&["you","shane"].includes(x.role)&&typeof x.text==="string")}catch{}
function saveQueue(){try{sessionStorage.setItem(queueKey,JSON.stringify(pending));return true}catch(error){report("Chapter archive queue could not be saved in this browser. Keep this page open until storage is available.");console.error("SHANE pending memory storage failed",error);return false}}
function report(message){let node=document.getElementById(statusId);if(!node){const host=document.getElementById("shane-journey-save")||document.getElementById("vision-first");if(!host)return;node=document.createElement("p");node.id=statusId;node.setAttribute("role","status");node.setAttribute("aria-live","polite");host.append(node)}node.textContent=message}
function add(role,text,id){if(!validId(id)||!["you","shane"].includes(role)||typeof text!=="string"||!text.trim())return;const turn={id:crypto.randomUUID(),endeavorId:id,role,text:text.slice(0,12000)};pending.push(turn);saveQueue();flush()}
async function flush(){if(flushing||!ready||!window.SHANEFractalMemory||!window.shaneAccountDb||!pending.length)return;flushing=true;try{while(pending.length){const item=pending[0],memory=window.SHANEFractalMemory.create(window.shaneAccountDb,item.endeavorId);await memory.append(item.role,item.text,item.id);pending.shift();saveQueue()}report("Your conversation turns are archived in SHANE's chapter memory.")}catch(error){report("Your conversation remains available. Chapter archiving is pending until memory storage is ready.");console.warn("SHANE chapter archive pending:",error?.message||error)}finally{flushing=false}}
document.addEventListener("shane:fractal-turn",event=>{const d=event.detail||{};if(endeavorId)add(d.role,d.text,endeavorId)});
document.addEventListener("shane:endeavor-changed",event=>{endeavorId=validId(event.detail?.id)?event.detail.id:null;flush()});
document.addEventListener("shane:endeavor-account-saved",event=>{endeavorId=validId(event.detail?.id)?event.detail.id:endeavorId;flush()});
document.addEventListener("shane:fractal-history-snapshot",event=>{const d=event.detail||{};if(!validId(d.id)||!Array.isArray(d.history))return;const existing=new Map();for(const x of pending.filter(x=>x.endeavorId===d.id)){const k=x.role+"\u0000"+x.text;existing.set(k,(existing.get(k)||0)+1)}for(const t of d.history){if(!t||!["you","shane"].includes(t.role)||typeof t.text!=="string")continue;const key=t.role+"\u0000"+t.text;if(existing.get(key)>0){existing.set(key,existing.get(key)-1)}else add(t.role,t.text,d.id)}});
document.addEventListener("shane:account-db-ready",flush);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",flush,{once:true});
else flush();
ready=true;flush();
})();