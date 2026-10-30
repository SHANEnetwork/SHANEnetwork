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
  await page.locator('#title').fill('Automated local test');
  await page.locator('#publication').selectOption('draft');
  assert.equal(await page.locator('#title').inputValue(),'Automated local test');
 } finally {await browser.close()}
});
