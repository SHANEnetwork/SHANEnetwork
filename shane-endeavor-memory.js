/* SHANE endeavor continuity: local, explicit checkpoints of the creative brief.
   Existing Supabase account saves remain the authoritative cross-device records. */
(()=>{"use strict";
const KEY="shane-endeavor-checkpoints-v1",MAX=12;
const $=id=>document.getElementById(id);
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(x)?x.filter(v=>v&&typeof v.id==="string"&&typeof v.vision==="string").slice(0,MAX):[]}catch{return []}}
function write(items){try{localStorage.setItem(KEY,JSON.stringify(items.slice(0,MAX)));return true}catch{return false}}
function start(){
 const vision=$("visionPrompt"),conversation=$("shane-idea-conversation");if(!vision||!conversation)return;
 const host=document.createElement("section");host.id="shane-endeavor-memory";host.setAttribute("aria-label","Endeavor memory");
 host.innerHTML='<style>#shane-endeavor-memory{margin:20px 0;padding:19px;border:1px solid #e4ccd2;border-radius:20px;background:#fffbf8}#shane-endeavor-memory h3{font:700 1.4rem Georgia,serif;color:#6b465e;margin:0 0 6px}#shane-endeavor-memory p{color:#685564;margin:6px 0 12px}#shane-endeavor-memory .controls{display:flex;flex-wrap:wrap;gap:9px;align-items:center}#shane-endeavor-memory select{width:min(100%,350px);padding:10px;border:1px solid #c9b5c0;border-radius:12px;background:white;color:#503d4d}#shane-endeavor-memory button{border:0;border-radius:20px;background:#76516a;color:white;padding:10px 15px;cursor:pointer;font:600 14px system-ui}#shane-endeavor-memory button.secondary{background:#f3e4eb;color:#5c3d53}#shane-endeavor-memory button:focus-visible,#shane-endeavor-memory select:focus-visible{outline:3px solid #cb963e;outline-offset:2px}</style><h3>Remember this endeavor</h3><p>Keep named creative checkpoints on this device, then return to a vision without retyping it. Account-based saving remains available separately.</p><div class="controls"><button id="shane-memory-save" type="button">Remember this vision</button><select id="shane-memory-list" aria-label="Saved visions"><option value="">Saved visions on this device</option></select><button class="secondary" id="shane-memory-load" type="button">Continue selected vision</button><button class="secondary" id="shane-memory-delete" type="button">Forget selected checkpoint</button></div><p id="shane-memory-status" role="status">Nothing is shared or published by remembering a vision here.</p>';
 conversation.append(host);
 const list=$("shane-memory-list"),status=$("shane-memory-status");
 function refresh(selected){list.replaceChildren(new Option("Saved visions on this device",""));for(const x of read()){const d=new Date(x.updated).toLocaleDateString();list.add(new Option(x.title+" · "+d,x.id))}if(selected)list.value=selected}
 $("shane-memory-save").onclick=()=>{
  const idea=vision.value.trim();if(!idea){status.textContent="Describe the endeavor in the creation area first.";vision.focus();return}
  const items=read(),title=(($("business")?.value||"").trim()||idea.split(/[.!?\n]/)[0]).slice(0,80)||"Untitled endeavor";
  const current=items.find(x=>x.id===list.value);
  const id=current?.id||"checkpoint-"+Date.now().toString(36);
  const entry={id,title,vision:idea.slice(0,12000),updated:new Date().toISOString()};
  const next=[entry,...items.filter(x=>x.id!==id)];
  if(!write(next)){status.textContent="This browser could not save the checkpoint. Your current draft is unchanged.";return}
  refresh(id);status.textContent="Saved on this device. Your website draft and conversation remain unchanged.";
 };
 $("shane-memory-load").onclick=()=>{
  const entry=read().find(x=>x.id===list.value);if(!entry){status.textContent="Choose a saved vision first.";return}
  const existing=vision.value.trim();
  if(existing&&existing!==entry.vision&&!confirm("Replace the current vision text with this saved checkpoint? Your website draft will not be replaced."))return;
  vision.value=entry.vision;vision.dispatchEvent(new Event("input",{bubbles:true}));vision.dispatchEvent(new Event("change",{bubbles:true}));
  status.textContent="Vision restored. Ask SHANE to continue developing it; the existing website draft has not been replaced.";
  vision.focus();
 };
 $("shane-memory-delete").onclick=()=>{
  const id=list.value;if(!id){status.textContent="Choose a saved vision first.";return}
  if(!confirm("Remove this saved checkpoint from this device?"))return;
  if(!write(read().filter(x=>x.id!==id))){status.textContent="Unable to update browser storage.";return}
  refresh();status.textContent="Checkpoint removed. Your current vision and website draft are unchanged.";
 };
 refresh();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();