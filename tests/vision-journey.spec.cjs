const { test, expect } = require('@playwright/test');

test('welcome vision reaches the conversation-first creator intact', async ({ page }) => {
  const vision = 'I want to create a welcoming neighborhood makers network where people can share ideas, find collaborators, and launch small community events.';
  await page.goto('http://127.0.0.1:8765/index.html');
  await expect(page.locator('#shaneWelcome')).toBeVisible();
  await page.locator('#welcomeIdea').fill(vision);
  await page.locator('#shaneWelcome button[type="submit"]').click();
  await expect(page).toHaveURL(/builder\.html\?from=welcome#vision-first/);
  await expect(page.locator('#visionPrompt')).toHaveValue(vision);
  await expect(page.locator('#visionStatus')).toContainText('Your vision is ready');
});

test('member journey pages retain their core entry points', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/my-network.html');
  await expect(page.locator('body')).toContainText('Network');
  await page.goto('http://127.0.0.1:8765/members.html');
  await expect(page.locator('#listingSection')).toHaveCount(1);
});

test('welcome draft is consumed once and does not overwrite later creator edits', async ({ page }) => {
  const vision = 'I want to create a local arts festival where artists, volunteers and neighbors can coordinate exhibits and performances together.';
  await page.goto('http://127.0.0.1:8765/index.html');
  await page.locator('#welcomeIdea').fill(vision);
  await page.locator('#shaneWelcome button[type="submit"]').click();
  await expect(page.locator('#visionPrompt')).toHaveValue(vision);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('shane-welcome-v1'))).toBeNull();
  const refinement = vision + ' We also need an accessible calendar and volunteer roles.';
  await page.locator('#visionPrompt').fill(refinement);
  await page.reload();
  await expect(page.locator('#visionPrompt')).not.toHaveValue(vision);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('shane-welcome-v1'))).toBeNull();
});

test('member network listing draft preserves endeavor context without publishing', async ({ page }) => {
  const draft = {
    title: 'Community Makers Festival',
    description: 'A welcoming festival for local makers and artists.',
    category: 'project',
    endeavor_id: 'f60d9a33-23a0-4d5d-9ad4-01f0ab893d5a'
  };
  await page.goto('http://127.0.0.1:8765/my-network.html');
  await page.evaluate(value => sessionStorage.setItem('shane-network-draft-v1', JSON.stringify(value)), draft);
  await page.goto('http://127.0.0.1:8765/members.html#listingSection');
  await expect(page.locator('#listingSection')).toHaveCount(1);
  await expect(page.locator('#title')).toHaveValue(draft.title);
  await expect(page.locator('#description')).toHaveValue(draft.description);
  await expect(page.locator('#category')).toHaveValue(draft.category);
  await expect(page.locator('#publication')).toHaveValue('draft');
  await expect(page.locator('#listing')).toHaveAttribute('data-endeavor-id', draft.endeavor_id);
  await expect(page.locator('#shaneDraftNotice')).toContainText('nothing has been published');
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('shane-network-draft-v1'))).not.toBeNull();
  await expect(page).toHaveURL(/members\.html#listingSection/);
});

test('starting a new vision preserves earlier conversation turns', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  const vision = page.locator('#visionPrompt');
  await vision.fill('Create a community makers festival with exhibits and workshops.');
  await page.locator('#visionGuide').click();
  await expect(page.locator('#shaneIdeaTurns')).toContainText('community makers festival');
  await vision.fill('Add a volunteer schedule and a welcoming neighborhood map.');
  await page.locator('#visionGuide').click();
  await expect(page.locator('#shaneIdeaTurns')).toContainText('community makers festival');
  await expect(page.locator('#shaneIdeaTurns')).toContainText('volunteer schedule');
});

test('vision AI prompt carries earlier requests and selects revision for existing drafts', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    sessionStorage.setItem('shane_idea_conversation_session_v2', JSON.stringify({
      draftReady: true,
      history: [{role:'you', text:'Include local artists and a shared event calendar.'}]
    }));
    document.getElementById('generateAI').addEventListener('click', event => {
      event.stopImmediatePropagation();
      event.preventDefault();
    }, {capture:true});
  });
  await page.locator('#visionPrompt').fill('Create a welcoming makers community with an event calendar.');
  await page.locator('#visionGuide').click();
  await expect(page.locator('#aiMode')).toHaveValue('revise');
  await expect(page.locator('#aiPrompt')).toHaveValue(/Earlier request 1: Include local artists/);
  const prompt = await page.locator('#aiPrompt').inputValue();
  expect(prompt).toContain('\nConversation context:\n');
  await expect(page.locator('#visionStatus')).toContainText('refining your existing website draft');
});

test('repeating the same vision does not duplicate the user request', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.locator('#visionPrompt').fill('Create a neighborhood volunteer network with shared projects.');
  await page.locator('#visionGuide').click();
  await page.locator('#visionGuide').click();
  await expect(page.locator('#shaneIdeaTurns [data-role="you"]')).toHaveCount(1);
});

test('oversized conversation requests remain editable and never trigger generation', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  const message = 'A'.repeat(12001);
  await page.locator('#shaneIdeaReply').fill(message);
  await page.locator('#shaneIdeaSend').click();
  await expect(page.locator('#shaneIdeaReply')).toHaveValue(message);
  await expect(page.locator('#shaneIdeaMessage')).toContainText('12,000-character conversation limit');
  await expect(page.locator('#shaneIdeaTurns [data-role="you"]')).toHaveCount(0);
});

test('endeavor memory keeps conversations isolated and restores them on return', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  const first = '11111111-1111-4111-8111-111111111111';
  const second = '22222222-2222-4222-8222-222222222222';
  await page.locator('#visionPrompt').fill('Create an arts cooperative with neighborhood workshops.');
  await page.locator('#visionGuide').click();
  await page.evaluate(id => document.dispatchEvent(new CustomEvent('shane:endeavor-changed', {detail:{id,reason:'saved'}})), first);
  await expect(page.locator('#shaneIdeaTurns')).toContainText('arts cooperative');
  await page.evaluate(id => document.dispatchEvent(new CustomEvent('shane:endeavor-changed', {detail:{id}})), second);
  await expect(page.locator('#shaneIdeaTurns')).not.toContainText('arts cooperative');
  await page.locator('#visionPrompt').fill('Build a volunteer gardening network.');
  await page.locator('#visionGuide').click();
  await expect(page.locator('#shaneIdeaTurns')).toContainText('gardening network');
  await page.evaluate(id => document.dispatchEvent(new CustomEvent('shane:endeavor-changed', {detail:{id}})), first);
  await expect(page.locator('#shaneIdeaTurns')).toContainText('arts cooperative');
  await expect(page.locator('#shaneIdeaTurns')).not.toContainText('gardening network');
});

test('starting a fresh endeavor clears the previous vision without deleting saved history', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.locator('#visionPrompt').fill('An arts festival for neighborhood musicians.');
  await page.locator('#visionGuide').click();
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('shane:endeavor-changed', {detail:{id:'33333333-3333-4333-8333-333333333333',reason:'saved'}})));
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#newEndeavor').click();
  await expect(page.locator('#visionPrompt')).toHaveValue('');
  await expect(page.locator('#shaneIdeaTurns')).not.toContainText('arts festival');
  const previous = await page.evaluate(() => JSON.parse(sessionStorage.getItem('shane_idea_conversation_endeavor_33333333-3333-4333-8333-333333333333')));
  expect(previous.history.some(turn => turn.text.includes('arts festival'))).toBeTruthy();
});

test('opening a different saved endeavor does not adopt an unrelated unsaved conversation', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.locator('#visionPrompt').fill('Create a neighborhood arts festival.');
  await page.locator('#visionGuide').click();
  await page.locator('#visionPrompt').fill('Create a community science workshop.');
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('shane:endeavor-changed', {detail:{id:'44444444-4444-4444-8444-444444444444'}})));
  await expect(page.locator('#shaneIdeaTurns')).not.toContainText('arts festival');
  const adopted = await page.evaluate(() => sessionStorage.getItem('shane_idea_conversation_endeavor_44444444-4444-4444-8444-444444444444'));
  expect(adopted).not.toContain('arts festival');
});

test('account memory is read before a local conversation can overwrite it', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.locator('#visionPrompt').fill('Create a community garden.');
  await page.locator('#visionGuide').click();
  await page.evaluate(() => {
    window.__memoryWrites = [];
    window.__resolveMemory = null;
    window.shaneAccountDb = {
      auth: { getUser: async () => ({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}}) },
      from: () => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: () => new Promise(resolve => {window.__resolveMemory = resolve})})})}),
        upsert: async payload => {window.__memoryWrites.push(payload);return {error:null}}
      })
    };
    document.dispatchEvent(new CustomEvent('shane:endeavor-changed',{detail:{id:'55555555-5555-4555-8555-555555555555'}}));
  });
  await expect.poll(() => page.evaluate(() => !!window.__resolveMemory)).toBe(true);
  await page.locator('#visionPrompt').fill('Add seed exchanges and shared garden tools.');
  await page.locator('#visionGuide').click();
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__memoryWrites.length)).toBe(0);
  await page.evaluate(() => window.__resolveMemory({data:null,error:null}));
  await expect.poll(() => page.evaluate(() => window.__memoryWrites.length)).toBe(1);
});

test('account-backed history takes priority over stale browser history', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.locator('#visionPrompt').fill('Create a neighborhood art fair.');
  await page.locator('#visionGuide').click();
  await page.evaluate(() => {
    window.__writes = [];
    window.shaneAccountDb = {
      auth: { getUser: async () => ({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}}) },
      from: () => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: async () => ({data:{history:[{role:'you',text:'Build a regional science fair.'},{role:'shane',text:'Science fair plan saved.'}],draft_ready:true},error:null})})})}),
        upsert: async payload => {window.__writes.push(payload);return {error:null}}
      })
    };
    document.dispatchEvent(new CustomEvent('shane:endeavor-changed',{detail:{id:'66666666-6666-4666-8666-666666666666'}}));
  });
  await expect(page.locator('#shaneIdeaTurns')).toContainText('Science fair plan saved.');
  await expect(page.locator('#shaneIdeaTurns')).not.toContainText('neighborhood art fair');
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__writes.some(p => p.history.some(t => t.text.includes('neighborhood art fair'))))).toBe(false);
});

test('reselecting the same endeavor does not interrupt account synchronization', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.__writes = [];
    window.shaneAccountDb = {
      auth: {getUser: async () => ({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}})},
      from: () => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: async () => ({data:null,error:null})})})}),
        upsert: async payload => {window.__writes.push(payload);return {error:null}}
      })
    };
    const event = () => document.dispatchEvent(new CustomEvent('shane:endeavor-changed',{detail:{id:'77777777-7777-4777-8777-777777777777'}}));
    event();
    event();
  });
  await page.locator('#visionPrompt').fill('Create a neighborhood astronomy club.');
  await page.locator('#visionGuide').click();
  await expect.poll(() => page.evaluate(() => window.__writes.length), {timeout:6000}).toBeGreaterThan(0);
});

test('late account restore merges conversation turns added during lookup', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.__resolveRestore = null;
    window.shaneAccountDb = {
      auth: {getUser: async () => ({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}})},
      from: () => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: () => new Promise(resolve => {window.__resolveRestore=resolve})})})}),
        upsert: async () => ({error:null})
      })
    };
    document.dispatchEvent(new CustomEvent('shane:endeavor-changed',{detail:{id:'88888888-8888-4888-8888-888888888888'}}));
  });
  await expect.poll(() => page.evaluate(() => !!window.__resolveRestore)).toBe(true);
  await page.locator('#visionPrompt').fill('Build a new community orchestra.');
  await page.locator('#visionGuide').click();
  await expect(page.locator('#shaneIdeaTurns')).toContainText('community orchestra');
  await page.evaluate(() => window.__resolveRestore({data:{history:[{role:'you',text:'Old astronomy club request'}],draft_ready:true},error:null}));
  await expect(page.locator('#shaneIdeaTurns')).toContainText('community orchestra');
  await expect(page.locator('#shaneIdeaTurns')).toContainText('Old astronomy club request');
});

test('overlapping local edits and remote restore merge account history', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.__resolveConflict = null;
    window.__conflictWrites = [];
    window.shaneAccountDb = {
      auth: {getUser: async () => ({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}})},
      from: () => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: () => new Promise(resolve => {window.__resolveConflict=resolve})})})}),
        upsert: async payload => {window.__conflictWrites.push(payload);return {error:null}}
      })
    };
    document.dispatchEvent(new CustomEvent('shane:endeavor-changed',{detail:{id:'99999999-9999-4999-8999-999999999999'}}));
  });
  await expect.poll(() => page.evaluate(() => !!window.__resolveConflict)).toBe(true);
  await page.locator('#visionPrompt').fill('Create a community theater.');
  await page.locator('#visionGuide').click();
  await page.evaluate(() => window.__resolveConflict({data:{history:[{role:'you',text:'Earlier saved community choir'}],draft_ready:true},error:null}));
  await expect(page.locator('#shaneIdeaTurns')).toContainText('community theater');
  await page.waitForTimeout(1600);
  await expect(page.locator('#shaneIdeaTurns')).toContainText('Earlier saved community choir');
  await expect.poll(() => page.evaluate(() => window.__conflictWrites.length)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__conflictWrites.at(-1).history.map(t => t.text).join(' '))).toContain('community theater');
});

test('opening an existing endeavor with the same vision never adopts unsaved conversation', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.locator('#visionPrompt').fill('Create a neighborhood arts festival.');
  await page.locator('#visionGuide').click();
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('shane:endeavor-changed', {detail:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',reason:'opened'}})));
  await expect(page.locator('#shaneIdeaTurns')).not.toContainText('neighborhood arts festival');
  const saved = await page.evaluate(() => sessionStorage.getItem('shane_idea_conversation_endeavor_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'));
  expect(saved).not.toContain('neighborhood arts festival');
});

test('account conversation saves are serialized when new ideas arrive rapidly', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.__pendingWrite = null;
    window.__saveCalls = [];
    window.shaneAccountDb = {
      auth: {getUser: async () => ({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}})},
      from: () => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: async () => ({data:null,error:null})})})}),
        upsert: payload => {
          window.__saveCalls.push(payload);
          if(window.__saveCalls.length===1)return new Promise(resolve => {window.__pendingWrite=resolve});
          return Promise.resolve({error:null});
        }
      })
    };
    document.dispatchEvent(new CustomEvent('shane:endeavor-changed',{detail:{id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'}}));
  });
  await page.locator('#visionPrompt').fill('Launch a community book exchange.');
  await page.locator('#visionGuide').click();
  await expect.poll(() => page.evaluate(() => !!window.__pendingWrite)).toBe(true);
  await page.locator('#visionPrompt').fill('Add a neighborhood reading festival.');
  await page.locator('#visionGuide').click();
  await page.waitForTimeout(1400);
  expect(await page.evaluate(() => window.__saveCalls.length)).toBe(1);
  await page.evaluate(() => window.__pendingWrite({error:null}));
  await expect.poll(() => page.evaluate(() => window.__saveCalls.length), {timeout:6000}).toBe(2);
  expect(await page.evaluate(() => window.__saveCalls[1].history.some(t => t.text.includes('reading festival')))).toBe(true);
});

test('account save lock covers delayed authentication as well as database writes', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.__authCalls = 0;
    window.__releaseAuth = null;
    window.__authPending = false;
    window.__writeCalls = [];
    window.shaneAccountDb = {
      auth: {getUser: () => {
        window.__authCalls++;
        if(window.__authPending && !window.__releaseAuth)
          return new Promise(resolve => {window.__releaseAuth = () => resolve({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}})});
        return Promise.resolve({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}});
      }},
      from: () => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: async () => ({data:null,error:null})})})}),
        upsert: async payload => {window.__writeCalls.push(payload);return {error:null}}
      })
    };
    document.dispatchEvent(new CustomEvent('shane:endeavor-changed',{detail:{id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc'}}));
  });
  await page.locator('#visionPrompt').fill('Build a neighborhood tool library.');
  await page.locator('#visionGuide').click();
  await expect.poll(() => page.evaluate(() => window.__writeCalls.length)).toBeGreaterThan(0);
  await page.evaluate(() => {window.__writeCalls=[];window.__authCalls=0;window.__authPending=true});
  await page.locator('#visionPrompt').fill('Add shared repair workshops.');
  await page.locator('#visionGuide').click();
  await expect.poll(() => page.evaluate(() => !!window.__releaseAuth)).toBe(true);
  await page.locator('#visionPrompt').fill('Add volunteer mentors.');
  await page.locator('#visionGuide').click();
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__authCalls)).toBe(1);
  await page.evaluate(() => {window.__authPending=false;window.__releaseAuth()});
  await expect.poll(() => page.evaluate(() => window.__writeCalls.length), {timeout:6000}).toBeGreaterThan(1);
});

test('saved account conversation restores in a fresh browser context', async ({ browser }) => {
  const endeavor = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
  const accountHistory = [{role:'you',text:'Create a regional makers cooperative.'},{role:'shane',text:'We can connect workshops, mentors and events.'}];
  const first = await browser.newContext();
  const page1 = await first.newPage();
  await page1.goto('http://127.0.0.1:8765/builder.html');
  await page1.evaluate(({endeavor,accountHistory}) => {
    window.shaneAccountDb = {
      auth: {getUser: async () => ({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}})},
      from: () => ({select: () => ({eq: () => ({eq: () => ({maybeSingle: async () => ({data:{history:accountHistory,draft_ready:true},error:null})})})}),upsert: async () => ({error:null})})
    };
    document.dispatchEvent(new CustomEvent('shane:endeavor-changed',{detail:{id:endeavor,reason:'opened'}}));
  }, {endeavor,accountHistory});
  await expect(page1.locator('#shaneIdeaTurns')).toContainText('regional makers cooperative');
  await first.close();
  const second = await browser.newContext();
  const page2 = await second.newPage();
  await page2.goto('http://127.0.0.1:8765/builder.html');
  await page2.evaluate(({endeavor,accountHistory}) => {
    window.shaneAccountDb = {
      auth: {getUser: async () => ({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}})},
      from: () => ({select: () => ({eq: () => ({eq: () => ({maybeSingle: async () => ({data:{history:accountHistory,draft_ready:true},error:null})})})}),upsert: async () => ({error:null})})
    };
    document.dispatchEvent(new CustomEvent('shane:endeavor-changed',{detail:{id:endeavor,reason:'opened'}}));
  }, {endeavor,accountHistory});
  await expect(page2.locator('#shaneIdeaTurns')).toContainText('regional makers cooperative');
  await expect(page2.locator('#shaneIdeaTurns')).toContainText('connect workshops, mentors and events');
  await second.close();
});

test('delayed account restoration excludes stale local turns but preserves new edits', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.locator('#visionPrompt').fill('Stale browser conversation about pottery.');
  await page.locator('#visionGuide').click();
  await page.evaluate(() => {
    window.__resolveStaleRestore = null;
    window.shaneAccountDb = {
      auth: {getUser: async () => ({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}})},
      from: () => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: () => new Promise(resolve => {window.__resolveStaleRestore=resolve})})})}),
        upsert: async () => ({error:null})
      })
    };
    document.dispatchEvent(new CustomEvent('shane:endeavor-changed',{detail:{id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',reason:'saved'}}));
  });
  await expect.poll(() => page.evaluate(() => !!window.__resolveStaleRestore)).toBe(true);
  await page.locator('#visionPrompt').fill('New request for a cooperative marketplace.');
  await page.locator('#visionGuide').click();
  await page.evaluate(() => window.__resolveStaleRestore({data:{history:[{role:'you',text:'Account history about local makers.'}],draft_ready:false},error:null}));
  await expect(page.locator('#shaneIdeaTurns')).toContainText('Account history about local makers.');
  await expect(page.locator('#shaneIdeaTurns')).toContainText('New request for a cooperative marketplace.');
  await expect(page.locator('#shaneIdeaTurns')).not.toContainText('Stale browser conversation about pottery.');
});

test('account client readiness restores an endeavor selected before database initialization', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.shaneAccountDb = null;
    document.dispatchEvent(new CustomEvent('shane:endeavor-changed',{detail:{id:'ffffffff-ffff-4fff-8fff-ffffffffffff',reason:'opened'}}));
  });
  await expect(page.locator('#shaneIdeaTurns')).not.toContainText('Account-ready memory');
  await page.evaluate(() => {
    window.shaneAccountDb = {
      auth:{getUser:async()=>({data:{user:{id:'11111111-1111-4111-8111-111111111111'}}})},
      from:()=>({
        select:()=>({eq:()=>({eq:()=>({maybeSingle:async()=>({data:{history:[{role:'you',text:'Account-ready memory for the festival.'}],draft_ready:false},error:null})})})}),
        upsert:async()=>({error:null})
      })
    };
    document.dispatchEvent(new Event('shane:account-db-ready'));
  });
  await expect(page.locator('#shaneIdeaTurns')).toContainText('Account-ready memory for the festival.');
});
