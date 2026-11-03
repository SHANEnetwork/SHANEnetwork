/* SHANE shared endeavor context and capability registry, v1.
   No network requests or automatic external actions. Independent published sites are excluded. */
(()=>{"use strict";
if(window.SHANEEndeavorCore)return;
const KEY="shane-active-endeavor-context-v1",HANDOFF="shane-creative-handoff-v1";
const listeners=new Set(),capabilities=new Map();
const safeId=v=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(v)?v:null;
const validText=v=>typeof v==="string"?v.trim().slice(0,12000):"";
let state={id:null,vision:"",source:"",updatedAt:0};
try{const data=JSON.parse(sessionStorage.getItem(KEY)||"null");if(data&&Number.isFinite(data.updatedAt)&&Date.now()-data.updatedAt<86400000){state={id:safeId(data.id),vision:validText(data.vision),source:String(data.source||"").slice(0,80),updatedAt:data.updatedAt}}}catch{}
const snapshot=()=>Object.freeze({...state});
function emit(reason){const detail={context:snapshot(),reason};document.dispatchEvent(new CustomEvent("shane:shared-endeavor-context",{detail}));for(const fn of listeners){try{fn(detail)}catch(error){console.error("SHANE context listener",error)}}}
function update(change={},reason="updated"){if(!change||typeof change!=="object")return snapshot();state={id:Object.prototype.hasOwnProperty.call(change,"id")?safeId(change.id):state.id,vision:Object.prototype.hasOwnProperty.call(change,"vision")?validText(change.vision):state.vision,source:typeof change.source==="string"?change.source.slice(0,80):state.source,updatedAt:Date.now()};try{sessionStorage.setItem(KEY,JSON.stringify(state))}catch{}emit(reason);return snapshot()}
function subscribe(fn){if(typeof fn!=="function")throw new TypeError("Listener must be a function");listeners.add(fn);return()=>listeners.delete(fn)}
function register(def){if(!def||typeof def.id!=="string"||!/^[a-z][a-z0-9.-]{1,79}$/.test(def.id)||typeof def.run!=="function")throw new TypeError("Invalid capability");if(capabilities.has(def.id))throw new Error("Capability already registered");const entry=Object.freeze({id:def.id,description:String(def.description||"").slice(0,240),permission:def.permission==="read"?"read":"explicit-action",run:def.run});capabilities.set(entry.id,entry);return()=>{if(capabilities.get(entry.id)===entry)capabilities.delete(entry.id)}}
function list(){return [...capabilities.values()].map(({id,description,permission})=>({id,description,permission}))}
async function invoke(id,input,options={}){const entry=capabilities.get(id);if(!entry)throw new Error("Unknown capability");if(entry.permission!=="read"||options.requireConsent){if(options.userApproved!==true)throw new Error("Explicit user approval required")}return entry.run({input,context:snapshot()})}
function handoff(vision,source){const text=validText(vision);if(text.length<20)throw new Error("Describe the endeavor in at least 20 characters");const created=Date.now();const previous=state.id;update({id:null,vision:text,source:source||"conversation"},"new-vision");try{sessionStorage.setItem(HANDOFF,JSON.stringify({text,created}));sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination:"builder.html",text,endeavorId:null,created,origin:source||"conversation",visibility:"private"}))}catch(error){update({id:previous},"handoff-storage-failed");throw error}return "builder.html#vision-first"}
document.addEventListener("shane:endeavor-changed",event=>{const id=safeId(event.detail?.id);if(id!==state.id)update({id},event.detail?.reason||"selected")});
window.SHANEEndeavorCore=Object.freeze({snapshot,update,subscribe,register,list,invoke,handoff});
})();