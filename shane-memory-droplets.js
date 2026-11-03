/* PMQOD-inspired software droplets: durable, individually addressed browser outbox.
   This is ordinary IndexedDB storage, not quantum hardware. */
(()=>{"use strict";if(window.SHANEMemoryDroplets)return;
const NAME="shane-memory-droplets-v1",STORE="pending-turns";
function open(){return new Promise((resolve,reject)=>{if(!("indexedDB" in window)){reject(new Error("IndexedDB unavailable"));return}const request=indexedDB.open(NAME,1);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"id"})};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
async function transaction(mode,operation){const db=await open();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);let result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error("Memory transaction aborted"));operation(store,v=>{result=v})})}finally{db.close()}}
function put(turn){if(!turn||typeof turn.id!=="string"||typeof turn.endeavorId!=="string"||typeof turn.text!=="string")return Promise.reject(new TypeError("Invalid memory turn"));return transaction("readwrite",(store)=>store.put(turn))}
function remove(id){return transaction("readwrite",store=>store.delete(id))}
function all(){return transaction("readonly",(store,set)=>{const request=store.getAll();request.onsuccess=()=>set(request.result);request.onerror=()=>{throw request.error}})}
window.SHANEMemoryDroplets=Object.freeze({put,remove,all});
})();