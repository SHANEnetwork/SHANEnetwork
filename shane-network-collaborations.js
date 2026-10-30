/* Shane Network: private collaboration hub. Existing Supabase RLS controls access. */
(()=>{
 const $=id=>document.getElementById(id);
 const box=$("networkCollaborationInbox"),status=$("networkCollaborationStatus");
 if(!box||!status||typeof sb==="undefined")return;
 let user=null;
 const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node};
 const action=(label,fn)=>{const button=el("button",label);button.type="button";button.addEventListener("click",fn);return button};
 async function load(){box.replaceChildren();status.textContent="Checking your invitations and collaborations…";try{
  const auth=await sb.auth.getUser();if(auth.error)throw auth.error;user=auth.data.user;
  if(!user){status.textContent="Sign in to see private invitations and shared workspaces.";return}
  const result=await sb.from("shane_collaboration_requests").select("id,listing_id,sender_id,recipient_id,message,status,created_at").order("created_at",{ascending:false}).limit(60);
  if(result.error)throw result.error;
  const rows=(result.data||[]).filter(r=>r.sender_id===user.id||r.recipient_id===user.id);
  status.textContent=rows.length?rows.filter(r=>r.status==="pending"&&r.recipient_id===user.id).length+" invitation(s) awaiting your response · "+rows.filter(r=>r.status==="accepted").length+" accepted collaboration(s)":"No invitations yet. Discover a public endeavor and introduce yourself to its creator.";
  const ids=[...new Set(rows.map(r=>r.listing_id).filter(Boolean))];let titles=new Map();
  if(ids.length){const names=await sb.from("shane_listings").select("id,title").in("id",ids);if(!names.error)titles=new Map((names.data||[]).map(n=>[n.id,n.title]));}
  for(const r of rows){const article=el("article");article.className="entry";const heading=el("h3",(r.recipient_id===user.id?"Received":"Sent")+" · "+(titles.get(r.listing_id)||"Collaboration"));const detail=el("p",r.message);const state=el("p","Status: "+r.status);article.append(heading,detail,state);
   if(r.status==="pending"&&r.recipient_id===user.id){for(const decision of ["accepted","declined"]){const btn=action(decision==="accepted"?"Accept invitation":"Decline invitation",async()=>{btn.disabled=true;const result=await sb.from("shane_collaboration_requests").update({status:decision}).eq("id",r.id).eq("recipient_id",user.id).eq("status","pending").select("id").maybeSingle();if(result.error){state.textContent="Could not update invitation: "+result.error.message;btn.disabled=false;return}await load()});article.append(btn,document.createTextNode(" "));}}
   if(r.status==="accepted"){const work=el("a","Open shared workspace");work.href="workspace.html?collaboration="+encodeURIComponent(r.id);const messages=el("a","Private conversation");messages.href="members.html?conversation="+encodeURIComponent(r.id)+"#collaborationSection";article.append(work,document.createTextNode(" · "),messages);}
   box.append(article);
  }
 }catch(error){status.textContent="Could not load collaborations: "+error.message}}
 const refresh=$("networkCollaborationRefresh");if(refresh)refresh.addEventListener("click",load);
 load();
})();
