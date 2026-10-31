/* Private, one-time vision transfer from Shane Network to the conversational Creator. */
(()=>{
 const key="shane_network_vision_handoff_v1",params=new URLSearchParams(location.search);
 let vision="";
 try{
  const saved=JSON.parse(sessionStorage.getItem(key)||"null");
  if(saved&&typeof saved.vision==="string"&&Number.isFinite(saved.created)&&Date.now()-saved.created<30*60*1000&&Date.now()>=saved.created)vision=saved.vision.trim();
 }catch{}
 // Compatibility with older links; clean the query immediately, before the page is ready.
 if(!vision)vision=(params.get("vision")||"").trim();
 if(params.has("vision")){
  params.delete("vision");const query=params.toString();
  history.replaceState(history.state,"",location.pathname+(query?"?"+query:"")+location.hash);
 }
 if(!vision)return;
 const apply=()=>{
  const prompt=document.getElementById("visionPrompt");
  const reply=document.getElementById("shaneIdeaReply");
  const message=document.getElementById("shaneIdeaMessage");
  if(prompt&&!prompt.value.trim())prompt.value=vision;
  if(reply&&!reply.value.trim())reply.value=vision;
  if(message)message.textContent="Your idea came with you. Keep exploring, refining and creating here. A website is only one possibility; nothing is published automatically.";
  try{sessionStorage.removeItem(key);}catch{}
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
})();
