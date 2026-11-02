const { chromium }=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.SHANE_TEST_BASE||'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const scenario of ['signed-in','guest','save-error']){
   const page=await browser.newPage();
   await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm',async route=>{
    const source=`export const createClient=()=>({auth:{getUser:async()=>({data:{user:${scenario==='guest'?'null':'{id:"00000000-0000-4000-8000-000000000001"}'}},error:null})},from:(table)=>({insert:(payload)=>({select:()=>({single:async()=>({data:{id:"11111111-1111-4111-8111-111111111111"},error:${scenario==='save-error'?'{message:"Test database failure"}':'null'}})})})})});`;
    await route.fulfill({status:200,contentType:'application/javascript',body:source});
   });
   await page.goto(base+'/network.html',{waitUntil:'domcontentloaded'});
   await page.locator('#shane-network-idea').fill('Start a local art collective');
   await page.locator('#shane-network-idea-start button[type="submit"]').click();
   await page.waitForURL('**/builder.html#vision-first',{timeout:20000});
   const result=await page.evaluate(()=>({
    idea:sessionStorage.getItem('shane-shared-idea-draft-v2:personal'),
    active:sessionStorage.getItem('shane-active-endeavor-v1'),
    handoff:sessionStorage.getItem('shane-intent-handoff-v1')
   }));
   assert.equal(result.idea,'Start a local art collective');
   assert.equal(JSON.parse(result.handoff).visibility,'private');
   if(scenario==='signed-in')assert.equal(JSON.parse(result.active).id,'11111111-1111-4111-8111-111111111111');
   if(scenario==='guest'||scenario==='save-error')assert(!result.active,'No account record should be claimed for '+scenario);
   console.log(scenario+': private handoff and navigation passed');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
