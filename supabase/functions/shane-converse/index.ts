// SHANE conversational AI: authenticated, owner-scoped, advisory only.
const cors={"Access-Control-Allow-Origin":"https://shanenetwork.github.io","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const reply=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{...cors,"Content-Type":"application/json"}});
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{headers:cors});
 if(req.method!=="POST")return reply({error:"POST required"},405);
 const token=req.headers.get("Authorization")?.replace(/^Bearer\s+/i,"");
 if(!token)return reply({error:"Sign in required"},401);
 const base=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY");
 if(!base||!anon)return reply({error:"Account connection unavailable"},503);
 const headers={apikey:anon,Authorization:"Bearer "+token};
 const auth=await fetch(base+"/auth/v1/user",{headers});
 if(!auth.ok)return reply({error:"Invalid account session"},401);
 const user=await auth.json();if(!user?.id)return reply({error:"Invalid user"},401);
 let input;try{input=await req.json()}catch{return reply({error:"Invalid request"},400)}
 const endeavorId=String(input?.endeavorId||"");
 if(!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(endeavorId))return reply({error:"Select a saved endeavor"},400);
 const record=await fetch(base+"/rest/v1/shane_endeavors?id=eq."+encodeURIComponent(endeavorId)+"&owner_id=eq."+encodeURIComponent(user.id)+"&select=id,title,idea,plan",{headers:{...headers,Accept:"application/vnd.pgrst.object+json"}});
 if(!record.ok)return reply({error:"This endeavor is not available in your account"},404);
 const endeavor=await record.json();if(!endeavor?.id)return reply({error:"Endeavor not found"},404);
 const request=String(input?.request||"").trim(),purpose=String(input?.purpose||endeavor.idea||"");
 if(request.length<2||request.length>30000||purpose.length>30000)return reply({error:"Request must contain 2 to 30000 characters; nothing was shortened"},413);
 const secret=Deno.env.get("SHANE_OPENAI_API_KEY")||Deno.env.get("OPENAI_API_KEY");
 if(!secret)return reply({error:"SHANE conversational AI provider is not configured"},503);
 let history=[];
 try {
  const query=base+"/rest/v1/shane_conversation_entries?owner_id=eq."+encodeURIComponent(user.id)+"&endeavor_id=eq."+encodeURIComponent(endeavorId)+"&entry_kind=in.(ai-request,ai-response)&archived_at=is.null&select=entry_kind,body,created_at&order=created_at.desc&limit=12";
  const prior=await fetch(query,{headers});
  if(prior.ok){
   const rows=await prior.json();
   if(Array.isArray(rows))history=rows.reverse().filter(row=>typeof row.body==="string").map(row=>({role:row.entry_kind==="ai-response"?"assistant":"user",content:row.body}));
  }
 }catch{}
 if(input?.mode==="creation-plan"){
  try{
   const provider=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+secret},body:JSON.stringify({model:"gpt-4.1-mini",temperature:0.2,max_tokens:1800,response_format:{type:"json_object"},messages:[{role:"system",content:"You are SHANE's private creation planner. Return only JSON with steps (array of objects containing type and vision) and explanation (short rationale). Allowed types: new-website, community, campaign, listing. At most eight steps. Include only what the person intends to create. No publication, messages, payments, or invitations. Do not invent dates or details. The person must approve every creation."},{role:"user",content:JSON.stringify({request,originalVision:endeavor.idea,purpose})}]})});
   if(!provider.ok)return reply({error:"SHANE's AI provider is unavailable"},502);
   const payload=await provider.json(),answer=payload.choices?.[0]?.message?.content;
   if(typeof answer!=="string"||!answer.trim())return reply({error:"No structured creation plan returned"},502);
   return reply({endeavorId,response:answer,saved:false,executed:false,requiresConfirmation:true});
  }catch{return reply({error:"AI creation planning failed"},502)}
 }
 const system="You are SHANE, a creative and practical AI partner helping an individual realize an endeavor. Understand the person's goal, propose concrete next steps and suitable capabilities, and preserve their original vision. Respond conversationally, without forms or jargon. Do not claim that you executed, published, messaged, charged, deployed or researched anything. No invented facts. Keep changes as proposals for the member to approve. Use concise plain text.";
 try{
  const provider=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+secret},body:JSON.stringify({model:"gpt-4.1-mini",temperature:0.6,max_tokens:1800,messages:[{role:"system",content:system},{role:"system",content:JSON.stringify({endeavorTitle:endeavor.title,originalVision:endeavor.idea,conversationPurpose:purpose})},...history,{role:"user",content:request}]})});
  if(!provider.ok)return reply({error:"SHANE's AI provider is unavailable"},502);
  const data=await provider.json(),answer=data.choices?.[0]?.message?.content;
  if(typeof answer!=="string"||!answer.trim())return reply({error:"No AI response returned"},502);
  let creationPlan=null;
  try{
   const planning=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+secret},body:JSON.stringify({model:"gpt-4.1-mini",temperature:0.2,max_tokens:1100,response_format:{type:"json_object"},messages:[{role:"system",content:"You are SHANE's private creation planner. Return only JSON {steps:[]} where steps has 0 to 8 items. Each item has type one of new-website, website, community, campaign, listing and a detailed vision. Only include creations the user actually wants to make now. Use an empty array for questions, comparisons, or requests to discuss ideas. For an explicit request to revise an existing website, use type website, never new-website. The member must select the existing website before execution. Never infer permission to publish, message, charge, or invite people. Keep every step's vision faithful to the user request and original endeavor."},{role:"user",content:JSON.stringify({request,endeavor:endeavor.idea,conversation:history.slice(-4)})}]})});
   if(planning.ok){
    const payload=await planning.json();
    const parsed=JSON.parse(payload.choices?.[0]?.message?.content||"{}");
    const allowed=new Set(["new-website","website","community","campaign","listing"]);
    if(Array.isArray(parsed.steps)&&parsed.steps.length<=8&&parsed.steps.every(step=>allowed.has(step?.type)&&typeof step.vision==="string"&&step.vision.trim().length>=8&&step.vision.length<=10000))creationPlan={steps:parsed.steps};
   }
  }catch{}
  return reply({endeavorId,response:answer,creationPlan,saved:false,executed:false,requiresConfirmation:true});
 }catch{return reply({error:"AI request failed"},502)}
});
