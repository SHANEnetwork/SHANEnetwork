const headers={"Access-Control-Allow-Origin":"https://shanenetwork.github.io","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const respond=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,"Content-Type":"application/json"}});
Deno.serve(async request=>{
 if(request.method==="OPTIONS")return new Response(null,{headers});
 if(request.method!=="POST")return respond({error:"POST required"},405);
 const auth=request.headers.get("Authorization")||"";
 if(!/^Bearer\s+\S+$/i.test(auth))return respond({error:"Sign in required"},401);
 const base=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY");
 if(!base||!anon)return respond({error:"Authentication unavailable"},503);
 const userResponse=await fetch(base+"/auth/v1/user",{headers:{apikey:anon,Authorization:auth}});
 if(!userResponse.ok)return respond({error:"Invalid session"},401);
 const user=await userResponse.json();
 let body;try{body=await request.json()}catch{return respond({error:"Invalid JSON"},400)}
 const id=String(body.endeavorId||"");
 if(!/^[a-f0-9-]{36}$/i.test(id))return respond({error:"Valid endeavor required"},400);
 const rowResponse=await fetch(base+"/rest/v1/shane_endeavors?id=eq."+encodeURIComponent(id)+"&owner_id=eq."+encodeURIComponent(user.id)+"&select=id,title,idea,plan,linked_site_id",{headers:{apikey:anon,Authorization:auth,Accept:"application/vnd.pgrst.object+json"}});
 if(!rowResponse.ok)return respond({error:"Endeavor unavailable in this account"},404);
 const endeavor=await rowResponse.json();
 if(!endeavor?.id)return respond({error:"Endeavor not found"},404);
 const secret=Deno.env.get("SHANE_OPENAI_API_KEY");
 if(!secret)return respond({error:"Analyst AI provider not configured"},503);
 const prompt=JSON.stringify({title:endeavor.title,vision:endeavor.idea,plan:endeavor.plan,hasLinkedSite:!!endeavor.linked_site_id}).slice(0,18000);
 try{
  const result=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+secret},body:JSON.stringify({model:"gpt-4.1-mini",temperature:0.2,max_tokens:1800,messages:[{role:"system",content:"You are SHANE Analyst, an independent and constructive evaluator. Assess feasibility, financial assumptions, evidence, operational dependencies, risks, and next decisive tests. Clearly separate user assertions from verified evidence and uncertainty. Do not invent facts or claim external research. Never change or publish the endeavor. Return concise plain text with sections: Assessment, Assumptions, Risks, Next tests."},{role:"user",content:prompt}]})});
  if(!result.ok)return respond({error:"Analyst provider unavailable"},502);
  const data=await result.json(),review=data.choices?.[0]?.message?.content;
  if(typeof review!=="string"||!review.trim())return respond({error:"Analyst returned no review"},502);
  return respond({endeavorId:id,review:review.slice(0,12000),saved:false});
 }catch{return respond({error:"Analyst request failed"},502)}
});