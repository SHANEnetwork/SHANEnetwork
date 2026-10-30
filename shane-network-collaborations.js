import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm";
const sb=createClient("https://ufxzogeixdwvbpdypojb.supabase.co","sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB");
/* Shane Network: private collaboration hub. Existing Supabase RLS controls access. */
(()=>{
 const $=id=>document.getElementById(id);
 const box=$("networkCollaborationInbox"),status=$("networkCollaborationStatus");
 if(!box||!status)return;
 let user=null;
 const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node};
 const action=(label,fn)=>{const button=el("button",label);button.type="button";button.addEventListener("click",fn);return button};
 async function load(){box.replaceChildren();status.textContent="Checking your invitations and collaborations…";try{
  const auth=await sb.auth.getUser();if(auth.error)throw auth.error;user=auth.data.user;
  if(!user){status.textContent="Sign in to see private invitations and shared workspaces.";return}
  const result=await sb.from("shane_collaboration_requests").select("id,listing_id,sender_id,recipient_id,message,status,created_at").order("created_at",{ascending:false}).limit(60);
  if(result.error)throw result.error;
  const rows=(result.data||[]).filter(r=>r.sender_id===user.id||r.recipient_id===user.id);
  rows.sort((a,b)=>Number(b.status==="pending"&&b.recipient_id===user.id)-Number(a.status==="pending"&&a.recipient_id===user.id)||new Date(b.created_at)-new Date(a.created_at));
  status.textContent=rows.length?rows.filter(r=>r.status==="pending"&&r.recipient_id===user.id).length+" invitation(s) awaiting your response · "+rows.filter(r=>r.status==="accepted").length+" accepted collaboration(s)":"No invitations yet. Discover a public endeavor and introduce yourself to its creator.";
  const ids=[...new Set(rows.map(r=>r.listing_id).filter(Boolean))];let titles=new Map();
  if(ids.length){const names=await sb.from("shane_listings").select("id,title").in("id",ids);if(!names.error)titles=new Map((names.data||[]).map(n=>[n.id,n.title]));}
  for(const r of rows){const article=el("article");article.className="entry";const heading=el("h3",(r.recipient_id===user.id?"Received":"Sent")+" · "+(titles.get(r.listing_id)||"Collaboration"));const detail=el("p",r.message);const state=el("p","Status: "+r.status);article.append(heading,detail,state);if(r.status==="pending"&&r.recipient_id===user.id){article.style.cssText="border-left:4px solid #287ab7;padding-left:14px;background:#f5f9ff";const attention=el("strong","Your response is requested");article.prepend(attention);}
   if(r.status==="pending"&&r.recipient_id===user.id){for(const decision of ["accepted","declined"]){const btn=action(decision==="accepted"?"Accept invitation":"Decline invitation",async()=>{btn.disabled=true;const result=await sb.from("shane_collaboration_requests").update({status:decision}).eq("id",r.id).eq("recipient_id",user.id).eq("status","pending").select("id").maybeSingle();if(result.error){state.textContent="Could not update invitation: "+result.error.message;btn.disabled=false;return}if(!result.data){state.textContent="This invitation has already changed. Refreshing…";await load();return}await load()});article.append(btn,document.createTextNode(" "));}}
   if(r.status==="accepted"){
    const work=el("a","Open shared workspace");work.href="workspace.html?collaboration="+encodeURIComponent(r.id);
    const messages=el("a","Private conversation");messages.href="members.html?conversation="+encodeURIComponent(r.id)+"#collaborationSection";
    const talk=action("Read and reply here",async()=>{
     const previous=article.querySelector("[data-network-conversation]");if(previous){previous.remove();talk.textContent="Read and reply here";return}
     const panel=el("section");panel.dataset.networkConversation="true";panel.style.cssText="margin-top:12px;padding:14px;border:1px solid #b5cde4;border-radius:10px;background:#f5f9ff";
     const feedback=el("p","Loading your private conversation…");feedback.setAttribute("role","status");
     const history=el("div");history.setAttribute("aria-live","polite");
     const form=el("form");const label=el("label","Your message");const field=el("textarea");field.required=true;field.maxLength=4000;field.rows=3;field.placeholder="Write to your collaborator";label.append(field);
     const send=el("button","Send privately");send.type="submit";const refresh=action("Refresh messages",readMessages);
     form.append(label,send);panel.append(history,form,refresh,feedback);article.append(panel);talk.textContent="Close conversation";
     async function readMessages(){const response=await sb.from("shane_collaboration_messages").select("sender_id,body,created_at").eq("request_id",r.id).order("created_at",{ascending:true}).limit(100);
      if(response.error){feedback.textContent="Could not read messages: "+response.error.message;return}
      history.replaceChildren();for(const m of response.data||[]){const entry=el("p");entry.style.cssText="padding:9px 0;border-bottom:1px solid #dce5ee;white-space:pre-wrap;overflow-wrap:anywhere";const who=el("strong",m.sender_id===user.id?"You":"Collaborator");entry.append(who,document.createTextNode(" · "+new Date(m.created_at).toLocaleString()+"\n"+m.body));history.append(entry)}
      feedback.textContent=response.data?.length?"Private conversation loaded.":"No messages yet. Start the conversation below.";
     }
     form.addEventListener("submit",async e=>{e.preventDefault();const body=field.value.trim();if(!body)return;send.disabled=true;
      const response=await sb.from("shane_collaboration_messages").insert({request_id:r.id,sender_id:user.id,body});send.disabled=false;
      if(response.error){feedback.textContent="Could not send message: "+response.error.message;return}field.value="";await readMessages()});
     await readMessages();
    });
    article.append(work,document.createTextNode(" · "),messages,document.createTextNode(" · "),talk);
   }
   box.append(article);
  }
 }catch(error){status.textContent="Could not load collaborations: "+error.message}}
 const refresh=$("networkCollaborationRefresh");if(refresh)refresh.addEventListener("click",load);
 sb.auth.onAuthStateChange(()=>{queueMicrotask(()=>load())});
 load();
})();
