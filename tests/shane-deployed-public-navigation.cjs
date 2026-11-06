// Deployed public-navigation verification; no credentials, mutations, or account claims.
// This checks only the public portion of LINK-02 and LINK-04, not all four acceptance gates.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=(process.env.SHANE_E2E_URL||'https://shanenetwork.org').replace(/\/$/,'');
const routes=['/','/builder.html','/dashboard.html','/members.html','/my-network.html','/detangler.html'];
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const errors=[];
 try{
  for(const route of routes){
   const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});
   assert(response,'No response for '+route);
   assert.equal(response.status(),200,'Unexpected HTTP status for '+route);
   assert(await page.locator('body').isVisible(),'Body invisible on '+route);
   const anchors=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(a=>({href:a.getAttribute('href'),text:a.textContent?.trim()||''})));
   const missing=anchors.filter(a=>a.href&&a.href.startsWith('#')&&a.href.length>1).filter(a=>!a.href.startsWith('#:'));
   for(const anchor of missing){
    const target=anchor.href.slice(1);
    const exists=await page.evaluate(id=>Boolean(document.getElementById(decodeURIComponent(id))),target);
    if(!exists)errors.push(route+' missing same-page target '+anchor.href);
   }
   console.log('PASS deployed public route '+route+' HTTP 200; '+anchors.length+' links inspected');
  }
  // Traverse real links, not only direct URL requests.
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  const entry=page.locator('a[href="detangler.html"]').first();
  assert(await entry.count(),'Homepage must expose Detangler');
  await entry.click();
  await page.waitForURL('**/detangler.html');
  assert(await page.getByRole('heading',{name:/Untangle what exists/i}).isVisible(),'Detangler must render after homepage navigation');
  await page.getByRole('link',{name:'Create an endeavor'}).click();
  await page.waitForURL('**/builder.html');
  assert(await page.locator('#visionPrompt').count(),'Builder must render the endeavor vision input');
  assert.deepEqual(errors,[],'Broken deployed same-page navigation targets');
  console.log('PASS deployed homepage → Detangler → endeavor builder navigation');
  console.log('LIMIT: signed-in account, saved-endeavor, collaboration, private links and dynamic permissions remain UNVERIFIED');
 }finally{await browser.close();}
})().catch(e=>{console.error('DEPLOYED PUBLIC NAVIGATION FAILED:',e.stack||e);process.exitCode=1;});
