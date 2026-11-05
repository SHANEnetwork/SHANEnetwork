// Deployed browser navigation smoke check. No authentication or public writes.
// This is LINK-02 navigation evidence only, NOT the 12-gate account journey.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.SHANE_E2E_URL || 'https://shanenetwork.org').replace(/\/$/, '');
const pages = [
 ['/', 'SHANEnetwork | Create, Discover, Grow'],
 ['/builder.html', 'Create with SHANE | From Idea to Endeavor'],
 ['/my-network.html', 'Shane Network | SHANEnetwork'],
 ['/network.html', 'Explore the Network | SHANEnetwork'],
 ['/workspace.html', 'Collaboration Workspace | SHANEnetwork']
];
(async () => {
 const browser = await chromium.launch({headless:true});
 try {
  const page = await browser.newPage();
  for (const [path, expectedTitle] of pages) {
   const response = await page.goto(base + path, {waitUntil:'domcontentloaded',timeout:30000});
   assert(response && response.status() >= 200 && response.status() < 400,
    'Navigation failed: ' + path + ' HTTP ' + (response?.status() ?? 'no response'));
   assert.equal(await page.title(), expectedTitle,
    'Wrong page content (possible host fallback) for ' + path);
   assert((await page.locator('body').innerText()).trim().length > 20,
    'Page rendered no meaningful content: ' + path);
   console.log('PASS deployed browser route: ' + path);
  }
  // Follow the PRIMARY homepage form through the actual endeavor entry page.
  // This checks session continuity, not authenticated database persistence.
  await page.goto(base + '/', {waitUntil:'domcontentloaded'});
  const vision = 'Build a community astronomy club with a welcoming website and stargazing events.';
  await page.locator('#shane-home-vision').fill(vision);
  await page.locator('#shane-home-vision-form button[type="submit"]').click();
  await page.waitForURL(url => url.pathname.endsWith('/start-endeavor.html'), {timeout:15000});
  assert.equal(await page.locator('#vision').inputValue(), vision,
   'Primary homepage vision must reach the endeavor entry page');
  await page.locator('#start button[type="submit"]').click();
  await page.waitForURL(url => url.pathname.endsWith('/dashboard.html'), {timeout:15000});
  // The arrival receiver consumes its one-time handoff; assert the visible result instead.
  await page.waitForFunction(expected => document.querySelector('#goalInput')?.value === expected,
   vision, {timeout:15000});
  assert.equal(await page.locator('#goalInput').inputValue(), vision,
   'Dashboard must display the exact incoming vision in its editable composer');
  console.log('PASS deployed primary vision handoff: homepage -> endeavor entry -> dashboard');
  // Continuing an arriving endeavor from the dashboard must open creation,
  // not silently leave the person on a page without a conversation composer.
  await page.locator('#pathFinder button[type="submit"]').click();
  await page.waitForURL(url => url.pathname.endsWith('/builder.html'), {timeout:15000});
  await page.waitForFunction(expected => document.querySelector('#visionPrompt')?.value === expected,
   vision, {timeout:15000});
  assert.equal(await page.locator('#visionPrompt').inputValue(), vision,
   'Dashboard Continue must preserve the original endeavor vision in the builder');
  console.log('PASS deployed endeavor continuation: dashboard -> builder');
  // Prove that actual visible homepage navigation works, not just direct URLs.
  for (const destination of ['builder.html', 'my-network.html', 'network.html']) {
   await page.goto(base + '/', {waitUntil:'domcontentloaded'});
   const link = page.locator('a[href="' + destination + '"]:visible').first();
   assert(await link.count(), 'Homepage lacks a visible navigation link to ' + destination);
   await link.click({timeout:15000});
   await page.waitForURL(url => url.pathname.endsWith('/' + destination), {timeout:15000});
   assert((await page.locator('body').innerText()).trim().length > 20,
    'Homepage navigation landed on an empty page: ' + destination);
   console.log('PASS homepage navigation click: ' + destination);
  }
 } finally { await browser.close(); }
})().catch(error => { console.error('Deployed navigation smoke failed:', error.message); process.exitCode = 1; });
