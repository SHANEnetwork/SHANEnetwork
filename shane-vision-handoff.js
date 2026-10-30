/* Preserve a visitor's creative direction when entering the SHANE builder from the Network. No automatic publication. */
(()=>{
  const params=new URLSearchParams(location.search);
  const vision=(params.get("vision")||"").trim().slice(0,2000);
  if(!vision)return;
  const apply=()=>{
    const prompt=document.getElementById("visionPrompt");
    const conversation=document.getElementById("shaneIdeaReply");
    if(prompt&&!prompt.value.trim())prompt.value=vision;
    if(conversation&&!conversation.value.trim())conversation.value=vision;
    const message=document.getElementById("shaneIdeaMessage");
    if(message)message.textContent="Your idea has been brought over from Shane Network. Review it and ask SHANE to create your first draft. Nothing is published automatically.";
    // Remove the private idea from the visible URL and browser history after reading it.
    params.delete("vision");
    const query=params.toString();
    history.replaceState(history.state,"",location.pathname+(query?"?"+query:"")+location.hash);
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
})();
