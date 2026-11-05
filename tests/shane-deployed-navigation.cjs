// Deployed browser navigation smoke check. No authentication or public writes.
// This is LINK-02 navigation evidence only, NOT the 12-gate account journey.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.SHANE_E2E_URL || 'https://shanenetwork.org').replace(/\/$/, '');
const paths = ['/', '/builder.html', '/my-network.html', '/network.html', '/workspace.html'];
(async () => {
 const browser = await chromium.launch({headless:true});
 try {
  const page = await browser.newPage();
  for (const path of paths) {
   const response = await page.goto(base + path, {waitUntil:'domcontentloaded',timeout:30000});
   assert(response && response.status() >= 200 && response.status() < 400,
    'Navigation failed: ' + path + ' HTTP ' + (response?.status() ?? 'no response'));
   assert((await page.locator('body').innerText()).trim().length > 20,
    'Page rendered no meaningful content: ' + path);
   console.log('PASS deployed browser route: ' + path);
  }
 } finally { await browser.close(); }
})().catch(error => { console.error('Deployed navigation smoke failed:', error.message); process.exitCode = 1; });
