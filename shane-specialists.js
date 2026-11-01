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
// Suggested destinations are proposals, never automatic execution.
// The catalog mirrors existing working SHANE modules and can be refined by a
// trusted model later without granting it new privileges.
const ENDEAVOR_CAPABILITIES=Object.freeze([
 {id:"builder",path:"builder.html",pattern:/website|webpage|storefront|online shop|landing page|portfolio|create a site/i},
 {id:"dashboard",path:"dashboard.html",pattern:/my endeavors|my projects|dashboard|pick up where i left off/i},
 {id:"conversation-history",path:"conversation-history.html",pattern:/conversation history|past conversations|previous ideas/i},
 {id:"communities",path:"communities.html",pattern:/community|club|association|member group/i},
 {id:"community-conversations",path:"community-conversations.html",pattern:/community chat|chat room|discussion room|community conversation/i},
 {id:"community-feed",path:"community-feed.html",pattern:/community announcement|post an update|community news/i},
 {id:"community-opportunities",path:"community-opportunities.html",pattern:/volunteers?|community opportunity|community service/i},
 {id:"community-members",path:"community-members.html",pattern:/member roles|community members|community permissions/i},
 {id:"community-history",path:"community-history.html",pattern:/community rollback|community history|restore community/i},
 {id:"campaigns",path:"campaigns.html",pattern:/event|concert|festival|fundrais|campaign|craft fair/i},
 {id:"workspace",path:"workspace.html",pattern:/tasks?|milestones?|coordinate|project plan|responsibilities/i},
 {id:"my-network",path:"my-network.html",pattern:/collaborat|partners?|team up|cofounder/i},
 {id:"network",path:"network.html",pattern:/discover|find people|find organizations|search network/i},
 {id:"members",path:"members.html",pattern:/listing|offer services?|member profile/i},
 {id:"growth",path:"growth.html",pattern:/marketing|outreach|promotion|grow audience|attract customers/i},
 {id:"payments",path:"payments.html",pattern:/payments?|checkout|donations?|sell tickets/i},
 {id:"appearance",path:"appearance.html",pattern:/theme|appearance|colors|personalize/i},
 {id:"request-build",path:"request-build.html",pattern:/custom build|done for me|build it for me/i},
 {id:"sports-district",path:"sports-district.html",pattern:/sports district|sports league|school athletics/i}
]);
export function planCapabilitySuggestions(request,vision=""){
 const text=String(request||"").slice(0,12000);
 const purpose=String(vision||"").slice(0,12000);
 const matched=ENDEAVOR_CAPABILITIES.filter(item=>item.pattern.test(text));
 const selected=matched.length?matched:ENDEAVOR_CAPABILITIES.filter(item=>item.pattern.test(purpose));
 return (selected.length?selected:[ENDEAVOR_CAPABILITIES[0]]).map(({id,path})=>({
  capabilityId:id,path,action:"prepare_editable_draft",requiresConfirmation:true
 }));
}
// One orchestration entry point for a conversational SHANE endeavor.
// Trusted server adapters provide actual AI output; browser modules may only
// prepare editable drafts and never silently publish or contact other people.
export async function respondToEndeavor({endeavor,request,invoke,rounds=1}={}){
 const result=await collaborate({endeavor,request,invoke,rounds,synthesize:true});
 return {
  endeavorId:result.endeavorId,
  request:String(request).slice(0,12000),
  response:result.synthesis,
  specialistContributions:result.history,
  proposedCapabilities:planCapabilitySuggestions(request,endeavor?.vision),
  requiresApproval:result.requiresApproval,
  status:"proposal_ready"
 };
}
export async function collaborate({endeavor,request,invoke,rounds=2,roles,synthesize=false}){
 if(!endeavor||!request||typeof invoke!=="function")throw Error("Endeavor, request and trusted model adapter are required");
 const selected=(roles||routeSpecialists(request)).filter(r=>Object.hasOwn(SPECIALISTS,r));
 if(!selected.length)throw Error("No supported specialists selected");
 const history=[],limit=Math.max(1,Math.min(MAX_ROUNDS,Math.floor(rounds)||1));
 const context={endeavorId:String(endeavor.id||""),vision:String(endeavor.vision||"").slice(0,12000),request:String(request).slice(0,12000)};
 for(let round=0;round<limit;round++){
  for(const role of selected){
   const result=await invoke({role,instructions:SPECIALISTS[role].purpose,context,history:history.map(({role,output})=>({role,output}))});
   if(typeof result!=="string"||!result.trim())throw Error(role+" returned no usable response");
   history.push({role,round:round+1,output:result.slice(0,30000)});
  }
 }
 // Optional synthesis turns separate specialist perspectives into one conversational
 // proposal. The trusted adapter remains responsible for real model execution.
 // Neither specialist results nor synthesis can trigger irreversible actions.
 let synthesis=null;
 if(synthesize){
  const output=await invoke({
   role:"synthesizer",
   instructions:"Unify the specialist findings into one actionable response to the person's latest request. Preserve the original endeavor vision and distinguish confirmed facts from suggestions. Identify contradictions, open questions, and next steps. Do not claim that publishing, payments, outreach, or code deployment has happened.",
   context,history:history.map(({role,output})=>({role,output}))
  });
  if(typeof output!=="string"||!output.trim())throw Error("Synthesis returned no usable response");
  synthesis=output.slice(0,30000);
 }
 return {endeavorId:context.endeavorId,roles:selected,history,synthesis,requiresApproval:["publish","payment","external_contact","share_private_data"],status:"review_required"};
}
