/* SHANE creative continuity: progressive enhancement of the existing builder.
   No new database tables or claims of autonomous AI services. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
function start(){
 const vision=$("visionPrompt");if(!vision)return;
 const anchor=$("vision-first")||vision.closest("section");
 if(!anchor)return;
 const section=document.createElement("section");section.id="shane-continuity";section.setAttribute("aria-label","Your connected creative network");
 section.innerHTML='<style>#shane-continuity{margin:20px 0;padding:22px;border:1px solid #dfc8bc;border-radius:22px;background:linear-gradient(130deg,#fffaf5,#f8eef4);box-shadow:0 12px 36px #583c5512}#shane-continuity h2{margin:0 0 8px;color:#65465e;font:700 clamp(1.4rem,3vw,2rem) Georgia,serif}#shane-continuity p{margin:7px 0 15px;color:#604d5b}#shane-continuity .paths{display:flex;flex-wrap:wrap;gap:9px}#shane-continuity a,#shane-continuity button{display:inline-flex;align-items:center;padding:10px 14px;border:1px solid #cdaebd;border-radius:999px;background:white;color:#69485f;font:650 14px system-ui;text-decoration:none;cursor:pointer}#shane-continuity a:hover,#shane-continuity button:hover{background:#f4e4ec}#shane-continuity .primary{background:#76516a;color:white}#shane-continuity .primary:hover{background:#60415a}#shane-continuity .small{font-size:.85rem;color:#715d69}#shane-continuity .paths a:focus-visible,#shane-continuity button:focus-visible{outline:3px solid #c68b2e;outline-offset:2px}</style><h2>One idea. A whole network of possibilities.</h2><p>Keep building here. When you are ready, carry your vision into discovery, collaboration, or your private endeavor space without copying it into another form.</p><div class="paths"><button class="primary" type="button" id="shane-continuity-discover">Find people for this idea</button><button type="button" id="shane-continuity-listing">Prepare a network listing</button><a href="dashboard.html">My endeavors</a><a href="my-network.html">Messages & connections</a><button type="button" id="shane-continuity-community">Create a community</button><button type="button" id="shane-continuity-campaign">Organize an event</button><button type="button" id="shane-continuity-growth">Grow this endeavor</button><button type="button" id="shane-continuity-request">Request a custom build</button><button type="button" id="shane-continuity-announce">Share a community update</button><button type="button" id="shane-continuity-opportunity">Create an opportunity</button></div><p class="small" id="shane-continuity-status" role="status">Your current draft stays here. Nothing is published automatically.</p>';
 anchor.append(section);
 const status=$("shane-continuity-status");
 const getVision=()=>vision.value.trim();
 const carry=(destination,url)=>{const idea=getVision();if(!idea){status.textContent="Describe your vision above first.";vision.focus();return}try{sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination,text:idea.slice(0,4000),created:Date.now()}));location.assign(url)}catch{status.textContent="This browser could not transfer the idea. Your builder draft is unchanged."}};
 $("shane-continuity-community").onclick=()=>carry("communities.html","communities.html");
 $("shane-continuity-campaign").onclick=()=>carry("campaigns.html","campaigns.html#create");
 $("shane-continuity-growth").onclick=()=>carry("growth.html","growth.html");
 $("shane-continuity-request").onclick=()=>carry("request-build.html","request-build.html");
 $("shane-continuity-announce").onclick=()=>carry("community-feed.html","community-feed.html");
 $("shane-continuity-opportunity").onclick=()=>carry("community-opportunities.html","community-opportunities.html");
 $("shane-continuity-discover").onclick=()=>{
  const idea=getVision();if(!idea){status.textContent="Describe your vision above first.";vision.focus();return}
  try{sessionStorage.setItem("shane_network_vision_handoff_v1",JSON.stringify({vision:idea.slice(0,12000)}))}catch{}
  location.assign("network.html?q="+encodeURIComponent(idea.slice(0,120)));
 };
 $("shane-continuity-discover").addEventListener("click",()=>{const idea=getVision();if(!idea)return;try{sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination:"network.html",text:idea.slice(0,4000),created:Date.now()}))}catch{}}, {capture:true});
 $("shane-continuity-listing").onclick=()=>{
  const idea=getVision();if(!idea){status.textContent="Describe your vision above first.";vision.focus();return}
  const name=($("business")?.value||"").trim();
  const title=name&&name!=="My New Idea"?name:idea.slice(0,100);
  const about=($("about")?.value||"").trim();
  try{sessionStorage.setItem("shane-network-draft-v1",JSON.stringify({title,description:about&&about!=="Tell visitors what you do, who you serve, and why it matters."?about:idea,category:"project",endeavor_id:null}));location.assign("members.html#listingSection")}
  catch{status.textContent="This browser could not transfer your draft. Your original vision remains in the builder."}
 };
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();