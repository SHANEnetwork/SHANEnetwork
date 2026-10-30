/* Owner-facing collaborator management panel. Authorization is enforced by Supabase RLS/RPC. */
(function(root){
 "use strict";
 function mount(container,client,endeavorId){
  if(!container||!root.SHANECollaborators||!root.SHANERevocation)throw Error("Collaborator panel dependencies missing");
  const status=document.createElement("p");status.setAttribute("role","status");
  const list=document.createElement("div");
  container.replaceChildren(status,list);
  let busy=false;
  async function refresh(){
   if(busy)return;
   status.textContent="Loading collaborators...";
   list.replaceChildren();
   try{
    const members=await root.SHANECollaborators.list(client,endeavorId);
    status.textContent=members.length?members.length+" collaborator(s)":"No collaborators yet.";
    for(const member of members){
     const item=document.createElement("section");
     const description=document.createElement("p");
     description.textContent=member.user_id+" · "+member.role+" · "+member.status;
     item.append(description);
     if(member.status==="active"||member.status==="invited"){
      const button=document.createElement("button");
      button.type="button";button.textContent="Revoke access";
      button.addEventListener("click",async()=>{
       if(busy)return;
       busy=true;button.disabled=true;status.textContent="Revoking access...";
       try{
        await root.SHANERevocation.revoke(client,endeavorId,member.user_id);
        busy=false;await refresh();
       }catch(error){busy=false;status.textContent=error.message;button.disabled=false;}
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
 root.SHANECollaboratorPanel=Object.freeze({mount});
})(typeof globalThis!=="undefined"?globalThis:this);
