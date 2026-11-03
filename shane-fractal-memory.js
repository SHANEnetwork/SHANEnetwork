/* SHANE Fractal Memory client: append-only turns and retrievable 20-turn chapters.
   Requires deployed shane-fractal-memory.sql and authenticated Supabase client.
   Do not use local browser state as proof of ownership. */
(()=>{"use strict";if(window.SHANEFractalMemory)return;
const uuid=()=>crypto.randomUUID();
const chapter=n=>Math.floor((n-1)/20)+1;
function create(db,endeavorId){if(!db||!/^[0-9a-f-]{36}$/i.test(endeavorId))throw new Error("Valid account and endeavor required");
 async function owner(){const {data,error}=await db.auth.getUser();if(error||!data?.user)throw new Error("Sign in required");const user=data.user;const result=await db.from("shane_endeavors").select("id").eq("id",endeavorId).eq("owner_id",user.id).maybeSingle();if(result.error||!result.data)throw new Error("Endeavor unavailable");return user.id}
 async function append(role,body,clientTurnId=uuid()){if(!["you","shane"].includes(role)||typeof body!=="string"||!body.trim()||body.length>12000)throw new Error("Invalid turn");
 const ownerId=await owner();const existing=await db.from("shane_memory_turns").select("turn_number").eq("endeavor_id",endeavorId).eq("client_turn_id",clientTurnId).maybeSingle();if(existing.error)throw existing.error;if(existing.data)return {turnNumber:existing.data.turn_number,chapter:chapter(existing.data.turn_number),duplicate:true};
 // Sequential append is optimistic. Concurrent devices may race; retry after uniqueness conflicts.
 for(let attempt=0;attempt<5;attempt++){const last=await db.from("shane_memory_turns").select("turn_number").eq("endeavor_id",endeavorId).order("turn_number",{ascending:false}).limit(1);if(last.error)throw last.error;const next=(last.data?.[0]?.turn_number||0)+1;
 const result=await db.from("shane_memory_turns").insert({endeavor_id:endeavorId,owner_id:ownerId,client_turn_id:clientTurnId,turn_number:next,role,body:body.trim()}).select("turn_number").single();
 if(!result.error)return {turnNumber:next,chapter:chapter(next),duplicate:false};
 if(result.error.code!=="23505")throw result.error;
 const retry=await db.from("shane_memory_turns").select("turn_number").eq("endeavor_id",endeavorId).eq("client_turn_id",clientTurnId).maybeSingle();if(retry.error)throw retry.error;if(retry.data)return {turnNumber:retry.data.turn_number,chapter:chapter(retry.data.turn_number),duplicate:true};
 }
 throw new Error("Concurrent writes require retry; original turn has not been discarded");
 }
 async function readChapter(number){await owner();if(!Number.isSafeInteger(number)||number<1)throw new Error("Invalid chapter");const start=(number-1)*20+1;const result=await db.from("shane_memory_turns").select("turn_number,role,body,created_at").eq("endeavor_id",endeavorId).gte("turn_number",start).lte("turn_number",start+19).order("turn_number");if(result.error)throw result.error;return result.data||[]}
 async function listChapters(){await owner();const result=await db.from("shane_memory_turns").select("turn_number").eq("endeavor_id",endeavorId).order("turn_number",{ascending:false}).limit(1);if(result.error)throw result.error;const count=result.data?.[0]?.turn_number||0;return {turns:count,chapters:Math.ceil(count/20)}}
 async function find(term,limit=20){await owner();if(typeof term!=="string"||term.trim().length<2)throw new Error("Search needs two characters");const escaped=term.trim().slice(0,120).replace(/[\\%_]/g,"\\$&");const result=await db.from("shane_memory_turns").select("turn_number,role,body,created_at").eq("endeavor_id",endeavorId).ilike("body","%"+escaped+"%").order("turn_number",{ascending:false}).limit(Math.min(50,Math.max(1,limit)));if(result.error)throw result.error;return (result.data||[]).map(t=>({...t,chapter:chapter(t.turn_number)}))}
 return Object.freeze({append,readChapter,listChapters,find})}
window.SHANEFractalMemory=Object.freeze({create,chapter});
})();
