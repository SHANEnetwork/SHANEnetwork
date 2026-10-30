/* SHANE specialist orchestration: shared endeavor, distinct perspectives.
   Provider calls are injected by the trusted server. Never place provider secrets in browser code. */
export const SPECIALISTS=Object.freeze({
 creator:{name:"Creator",purpose:"Develop possibilities, designs, plans and implementable revisions."},
 analyst:{name:"Analyst",purpose:"Check evidence, arithmetic, feasibility, cost and contradictions."},
 researcher:{name:"Researcher",purpose:"Collect and cite verifiable external evidence."},
 engineer:{name:"Engineer",purpose:"Review technical architecture and tests."},
 communicator:{name:"Communicator",purpose:"Prepare clear public writing and outreach."},
 gamemaster:{name:"Game Master",purpose:"Facilitate consensual fictional adventures and preserve campaign continuity."}
});
const MAX_ROUNDS=3;
export function routeSpecialists(request){
 const t=String(request||"").toLowerCase();
 const roles=new Set(["creator"]);
 if(/budget|cost|profit|feasib|audit|risk|viab|financial|business plan|compare/.test(t))roles.add("analyst");
 if(/research|evidence|source|competitor|market/.test(t))roles.add("researcher");
 if(/engineer|database|api|security|code|integration/.test(t))roles.add("engineer");
 if(/marketing|promotion|campaign|outreach|press/.test(t))roles.add("communicator");
 if(/game master|roleplay|adventure|campaign world/.test(t))roles.add("gamemaster");
 return [...roles];
}
export function validateSpecialist(profile){
 if(!profile||typeof profile!=="object")throw Error("A specialist profile is required");
 const name=String(profile.name||"").trim().slice(0,100);
 const purpose=String(profile.purpose||"").trim().slice(0,2000);
 if(!name||!purpose)throw Error("Specialist needs a name and purpose");
 return {name,purpose,visibility:"private",price:null,verified:false};
}
export async function collaborate({endeavor,request,invoke,rounds=2,roles}){
 if(!endeavor||!request||typeof invoke!=="function")throw Error("Endeavor, request and trusted model adapter are required");
 const selected=(roles||routeSpecialists(request)).filter(r=>Object.hasOwn(SPECIALISTS,r));
 if(!selected.length)throw Error("No supported specialists selected");
 const history=[],limit=Math.max(1,Math.min(MAX_ROUNDS,Math.floor(rounds)||1));
 const context={endeavorId:String(endeavor.id||""),vision:String(endeavor.vision||""),request:String(request)};
 for(let round=0;round<limit;round++){
  for(const role of selected){
   const result=await invoke({role,instructions:SPECIALISTS[role].purpose,context,history:history.map(({role,output})=>({role,output}))});
   if(typeof result!=="string"||!result.trim())throw Error(role+" returned no usable response");
   history.push({role,round:round+1,output:result.slice(0,30000)});
  }
 }
 return {endeavorId:context.endeavorId,roles:selected,history,requiresApproval:["publish","payment","external_contact","share_private_data"],status:"review_required"};
}
