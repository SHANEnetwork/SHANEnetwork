'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('node:path');
test('member interface exposes account and listing controls without a remote login', async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage();
  await page.goto('file://'+path.resolve('members.html'));
  assert.equal(await page.title(),'SHANE Members & Listings');
  assert.equal(await page.locator('#auth').count(),1);
  assert.equal(await page.locator('#listing').count(),1);
  assert.equal(await page.locator('#publication option[value="draft"]').count(),1);
  assert.equal(await page.locator('#publication option[value="published"]').count(),1);
  assert.equal(await page.locator('#listingFeedback[role="status"]').count(),1);
  assert.equal(await page.locator('#listingSection').isVisible(),false);
  assert.equal(await page.locator('#title').isVisible(),false);
  assert.equal(await page.locator('#email').isVisible(),true);
  assert.equal(await page.locator('#password').isVisible(),true);
  assert.equal(await page.locator('#signinButton').isVisible(),true);
  assert.equal(await page.locator('#signup').isVisible(),true);
  assert.equal(await page.locator('#signout').isVisible(),false);
  assert.equal(await page.locator('#mineSection').isVisible(),false);
  assert.equal(await page.locator('#collaborationSection').isVisible(),false);
 } finally {await browser.close()}
});

test('signed-in member can create a draft using isolated browser mocks',async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const stub=`const rows=[];
  const user={id:'local-test-member',email:'test@example.invalid'};
  const query=(table)=>{let mode='select';let data=null;const q={
   select(){mode='select';return q},eq(){return q},order(){return q},limit(){return q},in(){return q},
   maybeSingle:async()=>({data:null,error:null}),
   insert:async(value)=>{if(table==='shane_listings')rows.push({id:'local-listing-'+rows.length,...value});return {error:null}},
   update(value){mode='update';data=value;return q},
   then(resolve){if(mode==='update'&&table==='shane_listings'){Object.assign(rows[0],data);resolve({error:null});return}resolve({data:table==='shane_listings'?rows:[],error:null})}
  };return q};
  export function createClient(){return {auth:{getUser:async()=>({data:{user},error:null}),signOut:async()=>({error:null})},from:query}};`;
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm',route=>route.fulfill({status:200,contentType:'application/javascript',body:stub}));
  await page.goto('file://'+path.resolve('members.html'));
  await page.locator('#listingSection').waitFor({state:'visible',timeout:10000});
  await page.locator('#title').fill('Isolated browser draft');
  await page.locator('#category').selectOption('project');
  await page.locator('#description').fill('A local browser-only test');
  await page.locator('#createListingButton').click();
  await page.locator('#listingFeedback').getByText('Saved successfully:',{exact:false}).waitFor({timeout:10000});
  assert.match(await page.locator('#mine').innerText(),/Isolated browser draft/);
  await page.locator('#mine button').filter({hasText:'Edit'}).first().click();
  const editor=page.locator('#mine article form').first();
  await editor.locator('input').first().fill('Updated isolated browser draft');
  await editor.locator('button').filter({hasText:'Save changes'}).click();
  await page.locator('#status').getByText('Listing updated successfully.',{exact:true}).waitFor({timeout:10000});
  assert.match(await page.locator('#mine').innerText(),/Updated isolated browser draft/);
 }finally{await browser.close()}
});
