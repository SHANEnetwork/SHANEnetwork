// Dedicated, opt-in deployed browser acceptance: real UI, real account, private endeavor.
// This is NOT a substitute for artifact creation, history or two-account collaboration gates.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const {inspect}=require('../shane-endeavor-guard.cjs');
const { createClient } = require('@supabase/supabase-js');
const base = (process.env.SHANE_E2E_URL || 'https://shanenetwork.org').replace(/\/$/, '');
const email = process.env.SHANE_E2E_EMAIL, password = process.env.SHANE_E2E_PASSWORD;
const url = 'https://ufxzogeixdwvbpdypojb.supabase.co';
const key = 'sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB';
assert(email && password, 'Dedicated test account secrets are required');
const api = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
(async()=>{
 const {data:{user},error:authError}=await api.auth.signInWithPassword({email,password});
 assert.ifError(authError); assert(user?.id,'Test account must authenticate');
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext();
 const page=await context.newPage();
 const token='SHANE-BROWSER-'+Date.now();
 const vision='Create a private astronomy endeavor '+token+' with a website and community gatherings.';
 const revision='Revise the astronomy endeavor '+token+' to include monthly telescope workshops.';
 let id=null;
 try {
  await page.goto(base+'/members.html',{waitUntil:'domcontentloaded'});
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#auth button[type="submit"]').click();
  await page.waitForFunction(()=>document.body.innerText.includes('Signed in'),null,{timeout:20000});
  await page.goto(base+'/builder.html#vision-first',{waitUntil:'domcontentloaded'});
  await page.locator('#visionPrompt').fill(vision);
  await page.locator('#shaneBuildVisionNow').click();
  await page.waitForFunction(()=>document.querySelector('#shaneReturnSavedEndeavor')?.hidden===false,null,{timeout:25000});
  const link=await page.locator('#shaneReturnSavedEndeavor').getAttribute('href');
  id=new URL(link,base).searchParams.get('endeavor');
  assert(id,'Save must provide a durable endeavor ID');
  const {data:created,error:createError}=await api.from('shane_endeavors').select('id,idea,owner_id').eq('id',id).single();
  assert.ifError(createError);
  assert.equal(created.owner_id,user.id);
  assert.equal(created.idea,vision,'UI must persist the exact original vision');
  await page.waitForFunction(() => /linked to your endeavor/i.test(document.querySelector('#aiStatus')?.textContent || ''),null,{timeout:120000});
  const {data:joined,error:joinError}=await api.from('shane_endeavors').select('linked_site_id').eq('id',id).single();
  assert.ifError(joinError);
  assert(joined.linked_site_id,'EJ-05: created website must be linked to its endeavor');
  const {data:site,error:siteError}=await api.from('shane_sites').select('owner_id,status,content').eq('id',joined.linked_site_id).single();
  assert.ifError(siteError);
  assert.equal(site.owner_id,user.id);
  assert.equal(site.status,'draft');
  assert(site.content && Object.keys(site.content).length>2,'Website draft must contain editable content');
  const guard=inspect({id,ownerId:created.owner_id,originalVision:created.idea,components:[{id:joined.linked_site_id,endeavorId:id,ownerId:site.owner_id}]});
  assert.deepEqual(guard.findings,[]);
  await page.goto(base+'/'+link,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(expected=>document.querySelector('#visionPrompt')?.value===expected,vision,{timeout:25000});
  assert.equal(await page.locator('#visionPrompt').inputValue(),vision,'Returning by saved link must restore the vision');
  await page.waitForFunction(expected=>{
   const editor=document.querySelector('#business')?.value||'';
   const saved=document.querySelector('#savedSites')?.value||'';
   return Boolean(editor.trim())&&saved===expected;
  },joined.linked_site_id,{timeout:25000});
  assert.equal(await page.locator('#savedSites').inputValue(),joined.linked_site_id,
   'Returning to an endeavor must restore its linked website editor, not only its vision');
  await page.locator('#visionPrompt').fill(revision);
  await page.locator('#shaneSaveVisionEndeavor').click();
  await page.waitForFunction(()=>document.querySelector('#planRecoveryStatus')?.textContent?.includes('saved privately'),null,{timeout:25000});
  const {data:revised,error:revisionError}=await api.from('shane_endeavors').select('id,idea').eq('id',id).single();
  assert.ifError(revisionError);
  assert.equal(revised.idea,revision,'Revision must update the same endeavor');
  const {data:matches,error:matchError}=await api.from('shane_endeavors').select('id').eq('owner_id',user.id).in('idea',[vision,revision]);
  assert.ifError(matchError);
  assert.deepEqual(matches.map(x=>x.id),[id],'Save and revision must not create duplicate endeavors');
  await page.goto(base+'/members.html',{waitUntil:'domcontentloaded'});
  // Exercise the actual signed-in dashboard link, not just a constructed builder URL.
  await page.goto(base+'/dashboard.html',{waitUntil:'domcontentloaded'});
  const savedLink=page.locator('#endeavors a[href*="endeavor="+encodeURIComponent(id)+""]').first();
  await savedLink.waitFor({state:'visible',timeout:30000});
  const savedHref=await savedLink.getAttribute('href');
  assert.equal(new URL(savedHref,base).searchParams.get('endeavor'),id);
  await savedLink.click();
  await page.waitForFunction(expected=>document.querySelector('#visionPrompt')?.value===expected,revision,{timeout:25000});
  console.log('PASS real-account dashboard navigation to the same saved endeavor');
  await page.goto(base+'/members.html',{waitUntil:'domcontentloaded'});
  await page.locator('#signout').click();
  await page.waitForFunction(()=>document.querySelector('#session')?.textContent?.includes('Not signed in'),null,{timeout:15000});
  await page.goto(base+'/members.html',{waitUntil:'domcontentloaded'});
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#auth button[type="submit"]').click();
  await page.waitForFunction(()=>document.body.innerText.includes('Signed in'),null,{timeout:20000});
  await page.goto(base+'/builder.html?endeavor='+encodeURIComponent(id)+'#vision-first',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(expected=>document.querySelector('#visionPrompt')?.value===expected,revision,{timeout:25000});
  console.log('PASS deployed signed-in browser: create one private endeavor, reopen, revise same ID, sign out and return');
 } finally {
  await browser.close();
  if(id){
   const {data:record}=await api.from('shane_endeavors').select('linked_site_id').eq('id',id).eq('owner_id',user.id).maybeSingle();
   const {error:deleteError}=await api.from('shane_endeavors').delete().eq('id',id).eq('owner_id',user.id);
   if(deleteError) console.error('TEST CLEANUP REQUIRED for endeavor '+id+': '+deleteError.message);
   if(!deleteError&&record?.linked_site_id){
    const {error:siteDeleteError}=await api.from('shane_sites').delete().eq('id',record.linked_site_id).eq('owner_id',user.id).eq('status','draft');
    if(siteDeleteError) console.error('TEST CLEANUP REQUIRED for private site '+record.linked_site_id+': '+siteDeleteError.message);
   }
  }
  await api.auth.signOut();
 }
})().catch(error=>{console.error('Deployed account browser journey FAILED:',error.stack||error);process.exitCode=1});
