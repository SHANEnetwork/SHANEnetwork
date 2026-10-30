'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('members.html','utf8');
test('listing save reports success in the form, not only a transient global status',()=>{
 assert.match(html,/id="listingFeedback"[^>]*role="status"/);
 assert.match(html,/Saved successfully:/);
 assert.match(html,/Your listing appears under My listings/);
});
test('failed saves retain entered information and explain failure',()=>{
 assert.match(html,/Listing was not saved:/);
 assert.match(html,/Your entries are still here/);
 const start=html.indexOf("$('listing').onsubmit=");
 const end=html.indexOf('async function myListings()',start);
 const handler=html.slice(start,end);
 assert.ok(handler.indexOf("if(error)")<handler.indexOf("$('listing').reset()"));
});
test('save button is locked during asynchronous insertion and unlocked afterward',()=>{
 const start=html.indexOf("$('listing').onsubmit=");
 const end=html.indexOf('async function myListings()',start);
 const handler=html.slice(start,end);
 assert.match(handler,/button\.disabled=true/);
 assert.match(handler,/finally\{button\.disabled=false\}/);
});
test('publishing requires affirmative permission',()=>{
 assert.match(html,/status==='published'&&!confirmed/);
});
