const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.SHANE_TEST_BASE || 'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({headless:true});
 fs.mkdirSync('test-artifacts/responsive',{recursive:true});
 try{
  for(const [name,width,height] of [['phone',390,844],['small-phone',320,700],['laptop',1366,900]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'/network.html',{waitUntil:'domcontentloaded'});
   await page.locator('#shane-network-idea').waitFor();
   await page.screenshot({path:'test-artifacts/responsive/network-'+name+'.png',fullPage:true});
   const form=page.locator('#shane-network-idea-start');
   assert(await form.isVisible(),'Network creation form must be visible');
   assert(await page.locator('img.shane-network-panorama').count()===1,'Network illustration missing');
   const image=await page.locator('img.shane-network-panorama').evaluate(e=>({loaded:e.complete&&e.naturalWidth>0}));
   assert(image.loaded,'Network illustration did not load');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+4);
   assert(!overflow,'Horizontal page overflow at '+width+'px');
   const label=page.locator('label[for="shane-network-idea"]');
   assert(await label.isVisible(),'Prompt label not visible');
   await page.locator('#shane-network-idea').fill('Build a community music festival');
   assert.equal(await page.locator('#shane-network-idea').inputValue(),'Build a community music festival');
   assert(await page.locator('a[href="https://shonnetwork.org"]').count()===1,'SHON outbound link missing');
   await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
   await page.screenshot({path:'test-artifacts/responsive/home-'+name+'.png',fullPage:true});
   const cards=page.locator('.shane-entry-cards a');
   assert((await cards.count())>=5,'Homepage navigation cards missing');
   for(const link of await cards.all()){const href=await link.getAttribute('href');assert(href&&!href.startsWith('#'),'Card has no destination');}
   const homeOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+4);
   assert(!homeOverflow,'Homepage horizontal overflow at '+width+'px');
   console.log(name+': forms, artwork, cards, viewport checked; page errors: '+errors.length);
   if(errors.length)console.log('Browser errors (review):',errors.slice(0,3));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
