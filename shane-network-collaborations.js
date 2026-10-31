import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm";
const sb=createClient("https://ufxzogeixdwvbpdypojb.supabase.co","sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB");
/* Shane Network: private collaboration hub. Existing Supabase RLS controls access. */
(()=>{
 const $=id=>document.getElementById(id);
 const box=$("networkCollaborationInbox"),status=$("networkCollaborationStatus");
 if(!box||!status)return;
 let user=null,decisionPending=false,loadSequence=0;
 const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node};
 const action=(label,fn)=>{const button=el("button",label);button.type="button";button.addEventListener("click",fn);return button};
 async function load(){const sequence=++loadSequence;box.replaceChildren();status.textContent="Checking your invitations and collaborations…";try{
  const auth=await sb.auth.getUser();if(auth.error)throw auth.error;if(sequence!==loadSequence)return;user=auth.data.user;
  if(!user){status.textContent="Sign in to see private invitations and shared workspaces.";return}
  const result=await sb.from("shane_collaboration_requests").select("id,listing_id,sender_id,recipient_id,message,status,created_at").order("created_at",{ascending:false}).limit(60);
  if(result.error)throw result.error;if(sequence!==loadSequence)return;
  const rows=(result.data||[]).filter(r=>r.sender_id===user.id||r.recipient_id===user.id);
  status.textContent=rows.length?rows.filter(r=>r.status==="pending"&&r.recipient_id===user.id).length+" invitation(s) awaiting your response · "+rows.filter(r=>r.status==="accepted").length+" accepted collaboration(s)":"No invitations yet. Discover a public endeavor and introduce yourself to its creator.";
  const ids=[...new Set(rows.map(r=>r.listing_id).filter(Boolean))];let titles=new Map();
  if(ids.length){const names=await sb.from("shane_listings").select("id,title").in("id",ids);if(!names.error)titles=new Map((names.data||[]).map(n=>[n.id,n.title]));}if(sequence!==loadSequence)return;
  for(const r of rows){const article=el("article");article.className="entry";const heading=el("h3",(r.recipient_id===user.id?"Received":"Sent")+" · "+(titles.get(r.listing_id)||"Collaboration"));const detail=el("p",r.message);const state=el("p","Status: "+r.status);article.append(heading,detail,state);
   if(r.status==="pending"&&r.recipient_id===user.id){for(const decision of ["accepted","declined"]){const btn=action(decision==="accepted"?"Accept invitation":"Decline invitation",async()=>{if(decisionPending)return;decisionPending=true;for(const b of article.querySelectorAll("button"))b.disabled=true;try{const result=await sb.from("shane_collaboration_requests").update({status:decision}).eq("id",r.id).eq("recipient_id",user.id).eq("status","pending").select("id").maybeSingle();if(result.error)throw result.error;if(!result.data){state.textContent="This invitation has already changed. Refreshing…";}await load()}catch(error){state.textContent="Could not update invitation: "+(error?.message||String(error));for(const b of article.querySelectorAll("button"))b.disabled=false}finally{decisionPending=false}});article.append(btn,document.createTextNode(" "));}}
   if(r.status==="accepted"){const work=el("a","Open shared workspace");work.href="workspace.html?collaboration="+encodeURIComponent(r.id);const messages=el("a","Private conversation");messages.href="members.html?conversation="+encodeURIComponent(r.id)+"#collaborationSection";article.append(work,document.createTextNode(" · "),messages);}
   box.append(article);
  }
 }catch(error){if(sequence===loadSequence)status.textContent="Could not load collaborations: "+error.message}}
 const refresh=$("networkCollaborationRefresh");if(refresh)refresh.addEventListener("click",load);
 load();
})();
