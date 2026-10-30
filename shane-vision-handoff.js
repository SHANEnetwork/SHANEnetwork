/* Bring a network vision into SHANE's existing conversational creator, without publishing. */
(()=>{
 const params=new URLSearchParams(location.search);
 const vision=(params.get("vision")||"").trim().slice(0,2000);
 if(!vision)return;
 const apply=()=>{
  const prompt=document.getElementById("visionPrompt");
  const reply=document.getElementById("shaneIdeaReply");
  const message=document.getElementById("shaneIdeaMessage");
  // Do not overwrite an in-progress draft or conversation.
  if(prompt&&!prompt.value.trim())prompt.value=vision;
  if(reply&&!reply.value.trim())reply.value=vision;
  if(message)message.textContent="Your vision came with you from Shane Network. Review it, then ask SHANE to create or refine your website. Nothing is published automatically.";
  params.delete("vision");
  const remaining=params.toString();
  history.replaceState(history.state,"",location.pathname+(remaining?"?"+remaining:"")+location.hash);
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
})();
