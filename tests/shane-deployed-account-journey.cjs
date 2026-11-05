// Dedicated, opt-in deployed browser acceptance: real UI, real account, private endeavor.
// This is NOT a substitute for artifact creation, history or two-account collaboration gates.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
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
  await page.locator('#shaneSaveVisionEndeavor').click();
  await page.waitForFunction(()=>document.querySelector('#shaneReturnSavedEndeavor')?.hidden===false,null,{timeout:25000});
  const link=await page.locator('#shaneReturnSavedEndeavor').getAttribute('href');
  id=new URL(link,base).searchParams.get('endeavor');
  assert(id,'Save must provide a durable endeavor ID');
  const {data:created,error:createError}=await api.from('shane_endeavors').select('id,idea,owner_id').eq('id',id).single();
  assert.ifError(createError);
  assert.equal(created.owner_id,user.id);
  assert.equal(created.idea,vision,'UI must persist the exact original vision');
  await page.goto(base+'/'+link,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(expected=>document.querySelector('#visionPrompt')?.value===expected,vision,{timeout:25000});
  assert.equal(await page.locator('#visionPrompt').inputValue(),vision,'Returning by saved link must restore the vision');
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
  const logout=page.locator('#logout');
  if(await logout.count()) await logout.click();
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
   const {error:deleteError}=await api.from('shane_endeavors').delete().eq('id',id).eq('owner_id',user.id);
   if(deleteError) console.error('TEST CLEANUP REQUIRED for endeavor '+id+': '+deleteError.message);
  }
  await api.auth.signOut();
 }
})().catch(error=>{console.error('Deployed account browser journey FAILED:',error.stack||error);process.exitCode=1});
