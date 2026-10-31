/* Account-authorized collaboration links for the currently active endeavor.
   Existing workspace enforces accepted membership and message permissions. */
(()=>{"use strict";
const KEY="shane-active-endeavor-v1",$=id=>document.getElementById(id);
function active(){try{const id=JSON.parse(sessionStorage.getItem(KEY)||"null")?.id;return typeof id==="string"&&/^[a-f0-9-]{36}$/i.test(id)?id:null}catch{return null}}
function init(){
 const hub=$("shane-idea-conversation");if(!hub)return;
 const section=document.createElement("section");section.id="shane-endeavor-collaboration";section.setAttribute("aria-label","Collaborations for this endeavor");
 section.innerHTML='<style>#shane-endeavor-collaboration{padding:20px;margin:18px 0;border:1px solid #e0c7d1;border-radius:20px;background:#fffaf7}#shane-endeavor-collaboration h3{font:700 1.4rem Georgia,serif;color:#68445c;margin:0 0 7px}#shane-endeavor-collaboration p{color:#655361;margin:8px 0}#shane-endeavor-collaboration button{border:0;border-radius:20px;background:#75516a;color:#fff;padding:10px 15px;font:600 14px system-ui;cursor:pointer}#shane-endeavor-collaboration ul{list-style:none;margin:12px 0;padding:0}#shane-endeavor-collaboration li{padding:12px 0;border-top:1px solid #e8d8dd}#shane-endeavor-collaboration a{font-weight:650;color:#704963}</style><h3>People building this endeavor together</h3><p id="shane-collab-status" role="status">Open a saved endeavor to see its accepted collaborations here.</p><button id="shane-collab-refresh" type="button">Refresh collaborations</button><ul id="shane-collab-results"></ul>';
 hub.append(section);
 const status=$("shane-collab-status"),results=$("shane-collab-results");let generation=0;
 async function load(){
  const run=++generation;results.replaceChildren();const id=active();if(!id){status.textContent="Open a saved account endeavor to find its connected collaborations.";return}
  const sb=window.shaneAccountDb;if(!sb){status.textContent="Waiting for the account connection…";return}
  status.textContent="Finding accepted collaborations for this endeavor…";
  try{
   const {data:{user},error:authError}=await sb.auth.getUser();if(run!==generation)return;
   if(authError||!user){status.textContent="Sign in through Members to see private collaborations.";return}
   const {data:listings,error:listingError}=await sb.from("shane_listings").select("id,title").eq("endeavor_id",id).eq("owner_id",user.id).limit(100);
   if(run!==generation)return;if(listingError)throw listingError;
   if(!listings?.length){status.textContent="No owned Network listings are linked to this endeavor yet. You can prepare one from the creation conversation.";return}
   const ids=listings.map(x=>x.id);
   const {data:requests,error:requestError}=await sb.from("shane_collaboration_requests").select("id,listing_id,sender_id,recipient_id,status").in("listing_id",ids).eq("status","accepted").limit(100);
   if(run!==generation)return;if(requestError)throw requestError;
   const accepted=(requests||[]).filter(x=>x.sender_id===user.id||x.recipient_id===user.id);
   if(!accepted.length){status.textContent="This endeavor has linked listings, but no accepted collaboration workspaces yet.";return}
   const byId=new Map(listings.map(x=>[x.id,x]));
   for(const request of accepted){const li=document.createElement("li"),a=document.createElement("a");a.href="workspace.html?collaboration="+encodeURIComponent(request.id);a.textContent="Open collaboration: "+(byId.get(request.listing_id)?.title||"Network opportunity");const p=document.createElement("p");p.textContent="Continue shared messages, tasks, and planning in the existing protected workspace.";li.append(a,p);results.append(li)}
   status.textContent=accepted.length+" accepted collaboration"+(accepted.length===1?"":"s")+" linked to this endeavor.";
  }catch(e){if(run===generation)status.textContent="Could not retrieve collaborations: "+(e.message||String(e))}
 }
 $("shane-collab-refresh").onclick=load;document.addEventListener("shane:endeavor-changed",load);document.addEventListener("shane:account-db-ready",load);load();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();