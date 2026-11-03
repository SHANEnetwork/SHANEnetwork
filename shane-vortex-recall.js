/* SHANE Vortex: source-grounded associative retrieval over immutable 20-turn chapters.
   Inspired by cue-driven recall, temporal association, and selective activation.
   Derived indexes are disposable; original archive remains authoritative. */
(()=>{"use strict";
if(window.SHANEVortexRecall)return;
const STOP=new Set("a an and are as at be by for from has have i in is it of on or our that the their there this to was were what when where which who why with you your shane".split(" "));
const tokens=s=>[...new Set((String(s||"").toLowerCase().match(/[\\p{L}\\p{N}]{3,}/gu)||[]).filter(w=>!STOP.has(w)))];
function build(chapters){
 const nodes=[],links=new Map(),inverted=new Map();
 const connect=(a,b,weight,type)=>{if(a===b)return;for(const [x,y] of [[a,b],[b,a]]){if(!links.has(x))links.set(x,[]);links.get(x).push({id:y,weight,type})}};
 for(const chapter of chapters){
  const number=Number(chapter.number);
  if(!Number.isSafeInteger(number)||number<1)continue;
  const turns=Array.isArray(chapter.turns)?chapter.turns:[];
  let previous=null;
  for(const turn of turns){
   const index=Number(turn.turn_number);
   if(!Number.isSafeInteger(index)||index<1||typeof turn.body!=="string")continue;
   const id="turn:"+index,words=tokens(turn.body),node={id,turnNumber:index,chapter:number,role:turn.role,body:turn.body,createdAt:turn.created_at||null,words};
   nodes.push(node);
   for(const word of words){if(!inverted.has(word))inverted.set(word,[]);inverted.get(word).push(id)}
   if(previous)connect(previous,id,.32,"sequence");
   previous=id;
  }
 }
 const byId=new Map(nodes.map(n=>[n.id,n]));
 // Only connect a bounded number of neighbors for each distinctive shared term.
 for(const [word,ids] of inverted){if(ids.length<2||ids.length>32)continue;for(let i=0;i<ids.length;i++)for(let j=Math.max(0,i-5);j<i;j++)connect(ids[i],ids[j],.16/Math.sqrt(ids.length),"association:"+word)}
 return {nodes,byId,links,inverted};
}
function recall(graph,query,{limit=12,steps=2}={}){
 const words=tokens(query);if(!words.length)return [];
 const scores=new Map(),evidence=new Map();
 for(const word of words){for(const id of graph.inverted.get(word)||[]){scores.set(id,(scores.get(id)||0)+1/Math.sqrt((graph.inverted.get(word)||[]).length));evidence.set(id,[...(evidence.get(id)||[]),word])}}
 let frontier=new Map(scores);
 for(let step=0;step<Math.min(3,Math.max(0,steps));step++){
  const next=new Map();
  for(const [id,score] of frontier){for(const edge of graph.links.get(id)||[]){const amount=score*edge.weight*.55;if(amount<.001)continue;next.set(edge.id,(next.get(edge.id)||0)+amount)}}
  for(const [id,score] of next)scores.set(id,(scores.get(id)||0)+score);
  frontier=next;
 }
 return [...scores].sort((a,b)=>b[1]-a[1]).slice(0,Math.max(1,Math.min(50,limit))).map(([id,score])=>{const n=graph.byId.get(id);return {turnNumber:n.turnNumber,chapter:n.chapter,role:n.role,body:n.body,createdAt:n.createdAt,score,matchedTerms:evidence.get(id)||[],source:{type:"shane_memory_turns",turnNumber:n.turnNumber,chapter:n.chapter}}});
}
async function load(memory,{maxChapters=200}={}){
 const {chapters}=await memory.listChapters();if(chapters>maxChapters)throw new Error("Archive exceeds this recall window; narrow the endeavor or increase maxChapters explicitly");
 const result=[];for(let number=1;number<=chapters;number++)result.push({number,turns:await memory.readChapter(number)});
 return build(result);
}
window.SHANEVortexRecall=Object.freeze({build,recall,load,tokens});
})();