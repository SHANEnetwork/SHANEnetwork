/* Creator bridge for Fractal Memory. Existing conversation remains operational.
   The ledger is additive; failures never delete the current browser/account history. */
(()=>{"use strict";
const queueKey="shane-fractal-pending-v1",draftKey="shane-fractal-unsaved-v1",statusId="shane-fractal-status";
let pending=[],draft=[],endeavorId=null,flushing=false,ready=false;const droplets=()=>window.SHANEMemoryDroplets;const writes=new Map();
const validId=id=>typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id);
try{const saved=JSON.parse(sessionStorage.getItem(queueKey)||"[]");if(Array.isArray(saved))pending=saved.filter(x=>x&&validId(x.id)&&validId(x.endeavorId)&&["you","shane"].includes(x.role)&&typeof x.text==="string")}catch{}
try{const stored=JSON.parse(sessionStorage.getItem(draftKey)||"[]");if(Array.isArray(stored))draft=stored.filter(t=>t&&["you","shane"].includes(t.role)&&typeof t.text==="string")}catch{}
function saveDraft(){try{sessionStorage.setItem(draftKey,JSON.stringify(draft));return true}catch(error){report("Unsaved conversation could not be stored locally. Keep this page open.");console.warn("SHANE draft memory storage failed",error);return false}}
function saveQueue(){try{sessionStorage.setItem(queueKey,JSON.stringify(pending));return true}catch(error){report("Chapter archive queue could not be saved in this browser. Keep this page open until storage is available.");console.error("SHANE pending memory storage failed",error);return false}}
function report(message){let node=document.getElementById(statusId);if(!node){const host=document.getElementById("shane-journey-save")||document.getElementById("vision-first");if(!host)return;node=document.createElement("p");node.id=statusId;node.setAttribute("role","status");node.setAttribute("aria-live","polite");host.append(node)}node.textContent=message}
async function add(role,text,id){if(!validId(id)||!["you","shane"].includes(role)||typeof text!=="string"||!text.trim())return;const turn={id:crypto.randomUUID(),endeavorId:id,role,text:text.slice(0,12000)};pending.push(turn);saveQueue();const write=droplets()?droplets().put(turn):Promise.resolve();writes.set(turn.id,write);try{await write}catch(error){report("Memory droplet could not be stored locally. Keep this page open until archive sync completes.");console.warn("SHANE memory droplet save failed:",error)}finally{writes.delete(turn.id)}flush()}
async function flush(){if(flushing||!ready||!window.SHANEFractalMemory||!window.shaneAccountDb||!pending.length)return;flushing=true;try{while(pending.length){const item=pending[0];if(writes.has(item.id))await writes.get(item.id);const memory=window.SHANEFractalMemory.create(window.shaneAccountDb,item.endeavorId);const archived=await memory.append(item.role,item.text,item.id);
 // Retry the latest completed chapter on later turns when AI consolidation was unavailable.
 // The store's durable checkpoint makes repeated attempts idempotent.
 const completedChapter=Math.floor(archived.turnNumber/20);
 if(completedChapter>0){
  try{
   const turns=await memory.readChapter(completedChapter);
   if(turns.length===20){
    const result=await window.SHANEConversationStore?.consolidateVortexChapter?.({endeavorId:item.endeavorId,chapter:completedChapter,turns});
    if(result?.saved===false&&result.reason!=="already-consolidated")console.warn("Vortex consolidation pending:",result.reason);
   }
  }catch(error){console.warn("Vortex idea consolidation will need retry:",error)}
 }
 if(droplets())await droplets().remove(item.id);pending.shift();saveQueue()}report("Your conversation turns are archived in SHANE's chapter memory.")}catch(error){report("Your conversation remains available. Chapter archiving is pending until memory storage is ready.");console.warn("SHANE chapter archive pending:",error?.message||error)}finally{flushing=false}}
document.addEventListener("shane:fractal-turn",event=>{const d=event.detail||{};if(endeavorId)add(d.role,d.text,endeavorId);else if(["you","shane"].includes(d.role)&&typeof d.text==="string"&&d.text.trim()){draft.push({role:d.role,text:d.text});saveDraft()}});
document.addEventListener("shane:endeavor-changed",event=>{endeavorId=validId(event.detail?.id)?event.detail.id:null;flush();recoverChapters()});
document.addEventListener("shane:endeavor-account-saved",event=>{endeavorId=validId(event.detail?.id)?event.detail.id:endeavorId;flush();recoverChapters()});
document.addEventListener("shane:fractal-history-snapshot",event=>{const d=event.detail||{};if(!validId(d.id)||!Array.isArray(d.history))return;const combined=draft.length?draft:d.history;const existing=new Map();for(const x of pending.filter(x=>x.endeavorId===d.id)){const k=x.role+"\u0000"+x.text;existing.set(k,(existing.get(k)||0)+1)}for(const t of combined){if(!t||!["you","shane"].includes(t.role)||typeof t.text!=="string")continue;const key=t.role+"\u0000"+t.text;if(existing.get(key)>0){existing.set(key,existing.get(key)-1)}else add(t.role,t.text,d.id)}if(draft.length){draft=[];saveDraft()}});
// Recover chapter reasoning after a refresh, including when no new turns arrive.
// Keep original turns immutable and rely on durable consolidation checkpoints.
let checkingChapters=false;
async function recoverChapters(){
 if(checkingChapters||!ready||!endeavorId||!window.shaneAccountDb||!window.SHANEFractalMemory||!window.SHANEConversationStore?.consolidateVortexChapter)return;
 checkingChapters=true;
 try{
  const id=endeavorId;
  const memory=window.SHANEFractalMemory.create(window.shaneAccountDb,id);
  const summary=await memory.listChapters();
  const completed=Math.floor(summary.turns/20);
  for(let chapter=Math.max(1,completed-2);chapter<=completed;chapter++){
   if(endeavorId!==id)break;
   const turns=await memory.readChapter(chapter);
   if(turns.length===20)await window.SHANEConversationStore.consolidateVortexChapter({endeavorId:id,chapter,turns});
  }
 }catch(error){console.warn("Completed Vortex chapters await recovery:",error)}
 finally{checkingChapters=false}
}
document.addEventListener("shane:account-db-ready",()=>{flush();recoverChapters()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",flush,{once:true});
else flush();
async function hydrate(){try{if(droplets()){const saved=await droplets().all();const ids=new Set(pending.map(t=>t.id));for(const item of saved){if(validId(item.id)&&validId(item.endeavorId)&&!ids.has(item.id)){pending.push(item);ids.add(item.id)}}for(const item of pending){await droplets().put(item)}saveQueue()}}catch(error){console.warn("SHANE memory droplets unavailable:",error)}finally{ready=true;flush();recoverChapters()}}hydrate();
})();