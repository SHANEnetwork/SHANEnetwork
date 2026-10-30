/* Accessible invitation inbox for signed-in SHANE members. */
(function(root){
 "use strict";
 function mount(container,client){
  if(!container||!root.SHANEInvitations)throw Error("Invitation inbox dependencies missing");
  const heading=document.createElement("h2");heading.textContent="Endeavor invitations";
  const status=document.createElement("p");status.setAttribute("role","status");
  const list=document.createElement("div");
  container.replaceChildren(heading,status,list);
  async function refresh(){
   status.textContent="Loading invitations...";
   list.replaceChildren();
   try{
    const invitations=await root.SHANEInvitations.pending(client);
    status.textContent=invitations.length?invitations.length+" pending invitation(s)":"No pending invitations.";
    for(const invite of invitations){
     const item=document.createElement("section");
     const description=document.createElement("p");
     description.textContent="Endeavor "+invite.endeavor_id+"; proposed role: "+invite.role;
     item.append(description);
     for(const [label,accept] of [["Accept",true],["Decline",false]]){
      const button=document.createElement("button");button.type="button";button.textContent=label;
      button.addEventListener("click",async()=>{
       const buttons=item.querySelectorAll("button");buttons.forEach(b=>b.disabled=true);status.textContent="Saving your response...";
       try{await root.SHANEInvitations.respond(client,invite.endeavor_id,accept);await refresh();}
       catch(error){status.textContent=error.message;buttons.forEach(b=>b.disabled=false);}
      });
      item.append(button);
     }
     list.append(item);
    }
   }catch(error){status.textContent=error.message;}
  }
  refresh();
  return Object.freeze({refresh});
 }
 root.SHANEInvitationInbox=Object.freeze({mount});
})(typeof globalThis!=="undefined"?globalThis:this);
