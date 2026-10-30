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
  await page.locator('#title').fill('Permission guarded publication');
  await page.locator('#publication').selectOption('published');
  await page.locator('#createListingButton').click();
  assert.match(await page.locator('#status').innerText(),/Confirm permission before publishing/);
  assert.equal(await page.locator('#title').inputValue(),'Permission guarded publication');
  await page.locator('#attribution').check();
  await page.locator('#createListingButton').click();
  await page.locator('#listingFeedback').getByText('Saved successfully:',{exact:false}).waitFor({timeout:10000});
  assert.match(await page.locator('#mine').innerText(),/Permission guarded publication/);
 }finally{await browser.close()}
});

test('accepted collaboration opens private conversation in isolated Chromium',async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const stub=`const user={id:'isolated-recipient',email:'recipient@example.invalid'};
  const request={id:'isolated-request',listing_id:'isolated-project',sender_id:'isolated-sender',recipient_id:user.id,message:'Would love to collaborate',status:'accepted',created_at:'2026-10-30T12:00:00Z'};
  const messages=[];
  const query=(table)=>{const q={
   select(){return q},eq(){return q},order(){return q},limit(){return q},in(){return q},
   maybeSingle:async()=>({data:null,error:null}),
   insert:async(value)=>{if(table==='shane_collaboration_messages')messages.push({id:'message-'+messages.length,created_at:'2026-10-30T12:01:00Z',...value});return {error:null}},
   then(resolve){resolve({data:table==='shane_collaboration_requests'?[request]:table==='shane_collaboration_messages'?messages:table==='shane_listings'?[{id:'isolated-project',title:'Isolated collaboration project'}]:[],error:null})}
  };return q};
  export function createClient(){return {auth:{getUser:async()=>({data:{user},error:null})},from:query}};`;
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm',route=>route.fulfill({status:200,contentType:'application/javascript',body:stub}));
  await page.goto('file://'+path.resolve('members.html'));
  await page.locator('#collaborationInbox').getByText('Open private conversation').waitFor({timeout:10000});
  assert.match(await page.locator('#collaborationInbox').innerText(),/Open collaboration workspace/);
  await page.locator('#collaborationInbox').getByText('Open private conversation').click();
  await page.locator('textarea[aria-label="Private message"]').fill('Hello from isolated Chromium');
  await page.locator('#collaborationInbox').getByText('Send message').click();
  await page.locator('#collaborationInbox').getByText('You: Hello from isolated Chromium').waitFor({timeout:10000});
 }finally{await browser.close()}
});

test('recipient accepts pending invitation in isolated Chromium',async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const stub=`const user={id:'isolated-recipient',email:'recipient@example.invalid'};
  const request={id:'pending-invite',listing_id:'project-1',sender_id:'other-member',recipient_id:user.id,message:'Please collaborate on this endeavor',status:'pending',created_at:'2026-10-30T12:00:00Z'};
  const query=(table)=>{let mode='read';let patch=null;const q={
   select(){return q},eq(){return q},order(){return q},limit(){return q},in(){return q},
   update(value){mode='update';patch=value;return q},
   maybeSingle:async()=>{if(mode==='update'){Object.assign(request,patch);return {data:{id:request.id},error:null}}return {data:null,error:null}},
   then(resolve){resolve({data:table==='shane_collaboration_requests'?[request]:table==='shane_listings'?[{id:'project-1',title:'Invitation project'}]:[],error:null})}
  };return q};
  export function createClient(){return {auth:{getUser:async()=>({data:{user},error:null})},from:query}};`;
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm',route=>route.fulfill({status:200,contentType:'application/javascript',body:stub}));
  await page.goto('file://'+path.resolve('members.html'));
  await page.locator('#collaborationInbox').getByText('Accept',{exact:true}).waitFor({timeout:10000});
  await page.locator('#collaborationInbox').getByText('Accept',{exact:true}).click();
  await page.locator('#collaborationInbox').getByText('Open collaboration workspace').waitFor({timeout:10000});
  assert.match(await page.locator('#collaborationInbox').innerText(),/Status: accepted/);
 }finally{await browser.close()}
});

test('member sends one invitation and duplicate request is blocked in isolated Chromium',async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const stub=`const user={id:'isolated-sender',email:'sender@example.invalid'};
  const listing={id:'public-project',owner_id:'other-member',title:'Public test endeavor',category:'project',description:'Public test',region:'',status:'published'};
  const requests=[];
  const query=(table)=>{let filters=[];const q={
   select(){return q},eq(key,value){filters.push([key,value]);return q},order(){return q},limit(){return q},in(){return q},
   maybeSingle:async()=>({data:null,error:null}),
   insert:async(value)=>{if(table==='shane_collaboration_requests')requests.push({id:'request-'+requests.length,status:'pending',created_at:'2026-10-30T12:00:00Z',...value});return {error:null}},
   then(resolve){let data=table==='shane_listings'?[listing]:table==='shane_collaboration_requests'?requests:[];for(const [key,value] of filters)data=data.filter(row=>row[key]===value);resolve({data,error:null})}
  };return q};
  export function createClient(){return {auth:{getUser:async()=>({data:{user},error:null})},from:query}};`;
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm',route=>route.fulfill({status:200,contentType:'application/javascript',body:stub}));
  await page.goto('file://'+path.resolve('members.html'));
  await page.locator('#results').getByText('Request collaboration',{exact:true}).waitFor({timeout:10000});
  await page.locator('#results').getByText('Request collaboration',{exact:true}).click();
  const form=page.locator('[data-collaboration-composer]');
  await form.locator('textarea').fill('I would like to help organize this project.');
  await form.getByText('Send private invitation').click();
  await page.locator('#status').getByText('Collaboration request sent privately.',{exact:false}).waitFor({timeout:10000});
  await page.locator('#results').getByText('Request collaboration',{exact:true}).click();
  await page.locator('#status').getByText('You already have a pending invitation',{exact:false}).waitFor({timeout:10000});
  assert.equal(await page.locator('[data-collaboration-composer]').count(),0);
 }finally{await browser.close()}
});
