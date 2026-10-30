/* Private reusable site foundation, provisioned from a creator's interpreted vision.
   Uses existing shane_sites with owner-scoped RLS. Never publishes automatically. */
(function(root,factory){
 const api=factory(root.SHANEComposition||(typeof module==="object"&&module.exports?require("./shane-composition.js"):null));
 if(typeof module==="object"&&module.exports)module.exports=api;else root.SHANEProvision=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(engine){
 "use strict";
 if(!engine)throw Error("Composition engine required");
 async function provision(client,{spec,vision,siteId,editorContent}){
  const errors=engine.validate(spec);if(errors.length)throw Error(errors.join("; "));
  if(!client?.auth?.getUser||!client?.from)throw Error("Authenticated client required");
  const {data:auth,error:authError}=await client.auth.getUser();
  if(authError||!auth?.user?.id)throw Error("Sign in before creating a private website");
  const ownerId=auth.user.id;
  const composition={schemaVersion:spec.schemaVersion,modules:spec.modules,appearance:spec.appearance};
  let content={pages:[{title:"Home",slug:"home",draft:true}]};
  if(siteId){
   const {data:existing,error:existingError}=await client.from("shane_sites").select("id,owner_id,status,content").eq("id",siteId).eq("owner_id",ownerId).single();
   if(existingError||!existing||existing.owner_id!==ownerId)throw Error("Existing site ownership verification failed");
   if(existing.status!=="draft")throw Error("A published website cannot be overwritten by automatic draft setup");
   content={...(existing.content&&typeof existing.content==="object"&&!Array.isArray(existing.content)?existing.content:{})};
  }
  // The existing builder's AI output is the website source of truth when available.
  // Merge fields without deleting pages or unrelated saved website metadata.
  if(editorContent&&typeof editorContent==="object"&&!Array.isArray(editorContent)){
   const allowed=["business","name","tagline","about","services","pages","email","color","faq","testimonials","callToAction","gallery","networkModules","contact","brandColor","useBrandColor","brandFont","layoutStyle","backgroundStyle","backgroundColor","backgroundColor2"];
   for(const field of allowed){
    if(field==="pages")continue;
    if(Object.prototype.hasOwnProperty.call(editorContent,field))content[field]=editorContent[field];
   }
   if(typeof editorContent.pages==="string"){
    content.pages=editorContent.pages.split(/\\r?\\n/).filter(Boolean).slice(0,8).map((line,i)=>{
     const separator=line.indexOf("|");
     return {title:(separator<0?line:line.slice(0,separator)).trim()||"Page "+(i+1),body:(separator<0?"":line.slice(separator+1)).trim(),slug:"editor-page-"+(i+1),draft:true,shaneGenerated:true};
    });
   }
  }
  // The generated landing page is an editable draft, not a replacement for authored pages.
  if(!Array.isArray(content.pages)||content.pages.length===0)content.pages=[{title:"Home",slug:"home",draft:true}];
  const existingHome=content.pages.find(page=>page&&page.slug==="home");
  const plainVision=String(vision||"").trim().slice(0,12000);
  const homeTitle=String(spec.title||"My Endeavor").trim().slice(0,120);
  if(existingHome){
   if(!existingHome.title)existingHome.title=homeTitle;
   if(!existingHome.intro&&!existingHome.body&&!existingHome.html){
    existingHome.intro=plainVision;
    existingHome.shaneGenerated=true;
   }else if(existingHome.shaneGenerated){
    existingHome.intro=plainVision;
   }
  }else if(!content.pages.some(page=>page&&page.slug==="home")){
   content.pages.push({title:homeTitle,slug:"home",draft:true,intro:plainVision,shaneGenerated:true});
  }
  // Only add suggested sections when they do not already exist.
  const sectionTitles={projects:"Projects",publications:"Publications",events:"Events",memberships:"Community",messaging:"Messages",discussions:"Discussions",discovery:"Discover"};
  for(const module of spec.modules){
   const slug=module.type;
   if(!sectionTitles[slug]||content.pages.some(page=>page?.slug===slug))continue;
   content.pages.push({title:sectionTitles[slug],slug,draft:true,shaneGenerated:true,serviceStatus:"pending",intro:"This part of your endeavor is being prepared."});
  }
  content.shaneComposition=composition;
  content.sourceVision=String(vision||"").slice(0,12000);
  const payload={owner_id:ownerId,name:spec.title,content,status:"draft"};
  const query=siteId
    ?client.from("shane_sites").update(payload).eq("id",siteId).eq("owner_id",ownerId)
    :client.from("shane_sites").insert(payload);
  const {data,error}=await query.select("id,owner_id,name,status,content").single();
  if(error)throw Error("Private site creation failed: "+error.message);
  if(!data||data.owner_id!==ownerId||data.status!=="draft")throw Error("Private site ownership/status verification failed");
  return {siteId:data.id,status:"draft",persisted:true,provisionedModules:["pages"],pendingModules:spec.modules.filter(m=>m.type!=="pages").map(m=>m.type)};
 }
 return Object.freeze({provision});
});
