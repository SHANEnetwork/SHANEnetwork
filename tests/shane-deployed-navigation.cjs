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
  // Exercise the real first step of an endeavor without creating public content.
  // This is an anonymous handoff test, not proof of authenticated persistence.
  await page.goto(base + '/', {waitUntil:'domcontentloaded'});
  const vision = 'Build a community astronomy club with a welcoming website and stargazing events.';
  await page.locator('#welcomeIdea').fill(vision);
  await page.locator('#shaneWelcome button[type="submit"]').click();
  await page.waitForURL(url => url.pathname.endsWith('/builder.html'), {timeout:15000});
  await page.waitForFunction(expected =>
   document.querySelector('#visionPrompt')?.value === expected, vision, {timeout:15000});
  assert.equal(await page.locator('#visionPrompt').inputValue(), vision,
   'First endeavor vision must survive homepage-to-builder handoff');
  console.log('PASS deployed vision handoff: homepage to builder');
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
