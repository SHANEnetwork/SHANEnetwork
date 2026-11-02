const { test, expect } = require('@playwright/test');

// End-to-end continuity contract for the existing SHANE creator and network.
// These tests deliberately stop before publication or external invitations.
test('one vision moves from welcome to creator and retains its conversation on return', async ({ page }) => {
  const vision = 'Create a neighborhood bakery with a welcoming website and local collaborators.';
  await page.goto('http://127.0.0.1:8765/index.html');
  await page.locator('#welcomeIdea').fill(vision);
  await page.locator('#shaneWelcome button[type="submit"]').click();
  await expect(page).toHaveURL(/builder\.html/);
  await expect(page.locator('#visionPrompt')).toHaveValue(vision);
  await page.locator('#visionGuide').click();
  await expect(page.locator('#shaneIdeaTurns')).toContainText('neighborhood bakery');
  await page.goto('http://127.0.0.1:8765/network.html');
  await page.goto('http://127.0.0.1:8765/builder.html');
  await expect(page.locator('#shaneIdeaTurns')).toContainText('neighborhood bakery');
});

test('multi-capability journey prepares work without silently executing or publishing', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  const result = await page.evaluate(() => {
    const api = window.SHANECapabilities;
    if (!api) return { missing: true };
    const journey = api.journey({
      vision: 'Create a bakery website, find collaborators and organize a community event.',
      latestRequest: 'Help me find partners for our bakery.'
    });
    const website = journey.steps.find(step => step.path === 'builder.html');
    const prepared = website && api.prepareJourneyStep({ journey, capabilityId: website.capabilityId });
    const handoff = JSON.parse(sessionStorage.getItem('shane-intent-handoff-v1') || 'null');
    return { journey, prepared, handoff };
  });
  expect(result.missing).not.toBe(true);
  expect(result.journey.steps.map(step => step.path)).toContain('builder.html');
  expect(result.journey.steps.map(step => step.path)).toContain('my-network.html');
  expect(result.prepared.ok).toBe(true);
  expect(result.prepared.executed).toBe(false);
  expect(result.prepared.requiresConfirmation).toBe(true);
  expect(result.handoff.context.purpose).toContain('bakery website');
  expect(result.handoff.context.latestRequest).toContain('find partners');
  expect(result.handoff.destination).toBe('builder.html');
});

test('saved endeavor journey offers direct continuation without inventing discovery completion', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  const id = '77777777-7777-4777-8777-777777777777';
  await page.evaluate(endeavorId => {
    window.SHANECurrentEndeavor = {read: () => endeavorId};
    window.SHANEConversationStore = {
      endeavorSnapshot: async () => ({
        creations: [], collaborations: [{listingTitle:'Accepted teammate',url:'workspace.html'}],
        availability: {creations:true,collaborations:true}, creationPlan:null
      }),
      endeavors: async () => [{id:endeavorId,title:'Neighborhood bakery'}]
    };
    document.dispatchEvent(new Event('shane:conversation-store-ready'));
    document.dispatchEvent(new Event('shane:endeavor-context-ready'));
  }, id);
  const journey = page.locator('nav[aria-label="Endeavor journey"]');
  await expect(journey).toBeVisible();
  await expect(journey.getByRole('button', {name:'Continue saved endeavor'})).toBeVisible();
  await expect(journey.getByRole('link', {name:'Find collaborators'})).toBeVisible();
  await expect(journey.getByRole('link', {name:/Work together/})).toContainText('✓');
});

test('returning to a saved endeavor does not erase an unfinished message', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  const id = '88888888-8888-4888-8888-888888888888';
  await page.evaluate(endeavorId => {
    window.SHANECurrentEndeavor = {read: () => endeavorId};
    window.SHANEConversationStore = {
      endeavorSnapshot: async () => ({
        creations: [], collaborations: [], availability: {creations:true,collaborations:true},
        creationPlan: null
      }),
      endeavors: async () => [{id:endeavorId,title:'Bakery'}]
    };
    document.dispatchEvent(new Event('shane:conversation-store-ready'));
    document.dispatchEvent(new Event('shane:endeavor-context-ready'));
  }, id);
  const draft = 'Keep the bakery welcoming and add a community recipe exchange.';
  const entry = page.locator('#shane-shared-vision-input');
  await entry.fill(draft);
  await page.getByRole('button', {name:'Continue saved endeavor'}).click();
  await expect(entry).toHaveValue(draft);
  await expect(page.locator('.shane-endeavor-continuity-line')).toBeVisible();
});

test('saved work context is included in continuation without publishing or contacting anyone', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  const id = '99999999-9999-4999-8999-999999999999';
  await page.evaluate(endeavorId => {
    window.SHANECurrentEndeavor = {read: () => endeavorId};
    window.SHANEConversationStore = {
      endeavorSnapshot: async () => ({
        creations: [{type:'website',title:'Warm Bakery Website',url:'builder.html?site=123'}],
        collaborations: [{listingTitle:'Local Bakers Collective',url:'workspace.html'}],
        availability: {creations:true,collaborations:true}, creationPlan:null
      }),
      endeavors: async () => [{id:endeavorId,title:'Bakery'}]
    };
    document.dispatchEvent(new Event('shane:conversation-store-ready'));
    document.dispatchEvent(new Event('shane:endeavor-context-ready'));
  }, id);
  const entry = page.locator('#shane-shared-vision-input');
  await entry.fill('');
  await page.getByRole('button', {name:'Continue saved endeavor'}).click();
  await expect(entry).toHaveValue(/Warm Bakery Website/);
  await expect(entry).toHaveValue(/Local Bakers Collective/);
  await expect(entry).toHaveValue(/Ask before publishing or contacting anyone/);
});

test('returning member can restore full saved endeavor vision without silently overwriting a new message', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  const id = '99999999-9999-4999-8999-999999999999';
  const original = 'Create a welcoming neighborhood pottery studio website, beginner classes, and a collaborative community calendar.';
  await page.evaluate(({id,original}) => {
    window.SHANECurrentEndeavor = {read: () => id};
    window.SHANEConversationStore = {
      endeavorSnapshot: async () => ({
        endeavor:{id,title:'Pottery studio',idea:original},
        creations:[],collaborations:[],availability:{creations:true,collaborations:true},creationPlan:null
      }),
      endeavors: async () => [{id,title:'Pottery studio'}]
    };
    document.dispatchEvent(new Event('shane:conversation-store-ready'));
    document.dispatchEvent(new Event('shane:endeavor-context-ready'));
  }, {id,original});
  const restore = page.getByRole('button',{name:'Return to my original vision'});
  await expect(restore).toBeVisible();
  const composer = page.locator('#shane-shared-vision-input');
  await composer.fill('Keep my current unsent idea');
  page.once('dialog', dialog => dialog.dismiss());
  await restore.click();
  await expect(composer).toHaveValue('Keep my current unsent idea');
  page.once('dialog', dialog => dialog.accept());
  await restore.click();
  await expect(composer).toHaveValue(original);
});

test('saved endeavor resumes creation, network discovery and a guarded website revision across pages', async ({ page }) => {
  const endeavorId='11111111-1111-4111-8111-111111111111';
  const siteId='22222222-2222-4222-8222-222222222222';
  const request='Add a welcoming pottery workshop page while preserving the existing website.';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(({endeavorId,siteId,request})=>{
    sessionStorage.setItem('shane-website-revision-handoff-v1',JSON.stringify({
      endeavorId,siteId,request,at:Date.now()
    }));
  },{endeavorId,siteId,request});
  await page.goto('http://127.0.0.1:8765/builder.html?endeavor='+endeavorId+'&site='+siteId);
  await expect(page.locator('#aiPrompt')).toHaveValue(request);
  await expect(page.locator('#aiMode')).toHaveValue('revise');
  // The AI controls are inside the optional advanced editor. Exercise the guard
  // directly without forcing an advanced-mode UI that the user has not opened.
  await page.locator('#generateAI').evaluate(button => button.click());
  await expect(page.locator('#aiStatus')).toContainText(/Sign in|Open the saved website|Select and open/);
  await expect(page.locator('#updateSite')).toBeAttached();
  await page.goto('http://127.0.0.1:8765/builder.html?endeavor='+endeavorId);
  await expect(page.locator('#savedEndeavors')).toBeVisible();
  // This scenario checks browser continuity and the safe unsigned-in boundary.
  // Real database persistence, collaboration acceptance, and revision saving
  // still require a signed-in test account on an isolated project.
});
