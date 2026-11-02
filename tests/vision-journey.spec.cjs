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
  await page.getByRole('button', {name:'Start a new endeavor'}).filter({visible:true}).first().click();
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
      from: table => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: () => table==="shane_endeavors" ? Promise.resolve({data:null,error:null}) : new Promise(resolve => {window.__resolveMemory=resolve})})})}),
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
      from: table => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: () => table==="shane_endeavors" ? Promise.resolve({data:null,error:null}) : new Promise(resolve => {window.__resolveRestore=resolve})})})}),
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
      from: table => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: () => table==="shane_endeavors" ? Promise.resolve({data:null,error:null}) : new Promise(resolve => {window.__resolveConflict=resolve})})})}),
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
      from: table => ({
        select: () => ({eq: () => ({eq: () => ({maybeSingle: () => table==="shane_endeavors" ? Promise.resolve({data:null,error:null}) : new Promise(resolve => {window.__resolveStaleRestore=resolve})})})}),
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

test('creator discovery carries vision into Network search without publishing', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.locator('#visionPrompt').fill('Community pottery workshops and neighborhood makers');
  await page.locator('#shaneFindCollaborators').click();
  await expect(page).toHaveURL(/network\.html\?q=/);
  await expect(page.locator('#q')).toHaveValue(/pottery/i);
});

test('creator prepares an editable private introduction without sending an invitation', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.locator('#visionPrompt').fill('Community pottery workshops and neighborhood makers');
  await page.locator('#shanePrepareIntroduction').click();
  await expect(page).toHaveURL(/network\.html\?q=/);
  const draft = await page.evaluate(() => sessionStorage.getItem('shane_collaboration_intro_draft_v1'));
  expect(draft).toContain('Community pottery workshops');
  expect(draft).toContain('explore whether our ideas');
});

test('one visitor journey carries vision into creation refinement and private collaborator discovery', async ({ page }) => {
  const vision = 'Create a neighborhood pottery studio website with workshops and a community calendar.';
  await page.goto('http://127.0.0.1:8765/index.html');
  await page.locator('#welcomeIdea').fill(vision);
  await page.locator('#shaneWelcome button[type="submit"]').click();
  await expect(page).toHaveURL(/builder\.html/);
  await expect(page.locator('#visionPrompt')).toHaveValue(vision);
  await page.locator('#visionGuide').click();
  await expect(page.locator('#shaneIdeaTurns')).toContainText('neighborhood pottery studio');
  await page.locator('#visionPrompt').fill('Add accessible beginner workshops and a volunteer calendar.');
  await page.locator('#visionGuide').click();
  await expect(page.locator('#aiMode')).toHaveValue('new'); // No website draft exists yet; prior requests still inform first creation.
  await expect(page.locator('#aiPrompt')).toHaveValue(/Earlier request 1:/);
  await page.locator('#shanePrepareIntroduction').click();
  await expect(page).toHaveURL(/network\.html\?q=/);
  const prepared = await page.evaluate(() => sessionStorage.getItem('shane_collaboration_intro_draft_v1'));
  expect(prepared).toContain('volunteer calendar');
  await page.goBack();
  await expect(page.locator('#visionPrompt')).toBeVisible();
  // This browser scenario tests the visitor-facing handoff. Account-backed
  // persistence and actual invitations require a separate authenticated run.
});

test('saved endeavor revision handoff reaches the existing website editor without automatic generation', async ({ page }) => {
  const endeavorId='11111111-1111-4111-8111-111111111111';
  const siteId='22222222-2222-4222-8222-222222222222';
  const request='Add an accessible beginners pottery workshop page and preserve existing pages.';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(({endeavorId,siteId,request}) => {
    sessionStorage.setItem('shane-website-revision-handoff-v1',JSON.stringify({endeavorId,siteId,request,at:Date.now()}));
  },{endeavorId,siteId,request});
  await page.goto('http://127.0.0.1:8765/builder.html?site='+siteId+'&endeavor='+endeavorId);
  await expect(page.locator('#aiPrompt')).toHaveValue(request);
  await expect(page.locator('#aiMode')).toHaveValue('revise');
  await expect(page.locator('#aiStatus')).toContainText('Review the current website');
  expect(await page.evaluate(() => sessionStorage.getItem('shane-website-revision-handoff-v1'))).toBeNull();
  // The receiving page prepares a revision only; it does not call the generator.
});


test('connected Network tools follow endeavor switches without losing the conversation', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  const hub = page.locator('#shane-connected-workspace');
  await expect(hub).toHaveCount(1);
  const first = '11111111-1111-4111-8111-111111111111';
  const second = '22222222-2222-4222-8222-222222222222';
  await page.evaluate(id => document.dispatchEvent(new CustomEvent('shane:endeavor-changed', { detail: { id } })), first);
  await hub.locator('[data-kind="messages"]').click();
  await expect(hub.locator('iframe')).toHaveAttribute('src', new RegExp('my-network\\.html\\?endeavor=' + first));
  await page.evaluate(id => document.dispatchEvent(new CustomEvent('shane:active-endeavor-changed', { detail: { id } })), second);
  await expect(hub.locator('iframe')).toHaveAttribute('src', new RegExp('my-network\\.html\\?endeavor=' + second));
  await expect(hub.locator('#shane-connected-status')).toContainText('Switched');
  await expect(page.locator('#visionPrompt')).toBeVisible();
});

test('conversation commands open connected tools without changing the creative prompt', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  const hub=page.locator('#shane-connected-workspace');
  await page.locator('#visionPrompt').fill('Show my messages');
  await page.locator('#visionGuide').click();
  await expect(hub.locator('iframe')).toHaveAttribute('src',/my-network\.html/);
  await expect(page.locator('#visionPrompt')).toHaveValue('Show my messages');
  await page.locator('#visionPrompt').fill('I want a website where people can find collaborators');
  await page.locator('#visionGuide').click();
  await expect(hub.locator('iframe')).toHaveAttribute('src',/my-network\.html/);
});

test('conversation intent event opens a requested workspace and ignores unknown capabilities', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  const hub=page.locator('#shane-connected-workspace');
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('shane:conversation-network-intent',{detail:{kind:'endeavors'}})));
  await expect(hub.locator('iframe')).toHaveAttribute('src',/dashboard\.html/);
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('shane:conversation-network-intent',{detail:{kind:'unsupported'}})));
  await expect(hub.locator('iframe')).toHaveAttribute('src',/dashboard\.html/);
});

test('connected workspace preserves the draft while previewing an endeavor creation plan', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.SHANEConversationStore={
      proposeCreationSequence:({vision,endeavorId})=>({ready:true,steps:[{type:'new-website',vision,endeavorId},{type:'community',vision,endeavorId}]})
    };
  });
  await page.locator('#visionPrompt').fill('Build a pottery website and community for local artists');
  await page.locator('#shane-connected-plan').click();
  await expect(page.locator('#shane-connected-status')).toContainText('website, community');
  await expect(page.locator('#visionPrompt')).toHaveValue('Build a pottery website and community for local artists');
  await expect(page.locator('#shane-connected-create')).toBeDisabled();
});

test('connected workspace can retrieve account-backed saved creations', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.SHANEConversationStore={
      recentCreations:async()=>[{id:'11111111-1111-4111-8111-111111111111',type:'website',title:'Pottery studio',url:'builder.html?site=11111111-1111-4111-8111-111111111111'}]
    };
  });
  await page.locator('#shane-connected-recent').click();
  await expect(page.locator('#shane-connected-creations a')).toContainText(['Pottery studio (website)']);
  await expect(page.locator('#shane-connected-creations button')).toContainText(['Revise Pottery studio']);
});

test('connected workspace only displays accepted account collaborations', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.SHANEConversationStore={
      joinedCollaborations:async()=>[
        {status:'accepted',listingTitle:'Pottery fair',role:'collaborator',url:'workspace.html?collaboration=11111111-1111-4111-8111-111111111111'},
        {status:'pending',listingTitle:'Unaccepted request',role:'collaborator',url:'workspace.html?collaboration=22222222-2222-4222-8222-222222222222'}
      ]
    };
  });
  await expect(page.locator('#shane-connected-collaborations')).toBeVisible();
  await page.locator('#shane-connected-collaborations').click();
  await expect(page.locator('#shane-connected-collaborations-list')).toContainText('Pottery fair');
  await expect(page.locator('#shane-connected-collaborations-list')).not.toContainText('Unaccepted request');
});

test('conversation revision uses a selected saved website and explicit approval', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.__revisionCalls=[];
    window.confirm=()=>true;
    window.SHANEConversationStore={
      recentCreations:async()=>[{id:'11111111-1111-4111-8111-111111111111',type:'website',title:'Pottery studio',url:'builder.html?site=11111111-1111-4111-8111-111111111111'}],
      reviseSite:async args=>{window.__revisionCalls.push(args);return {saved:true,siteId:args.siteId}}
    };
  });
  await page.locator('#shane-connected-recent').click();
  await page.locator('#shaneIdeaReply').fill('Please add a gallery of ceramic pieces');
  await page.getByRole('button',{name:'Revise Pottery studio'}).click();
  await expect(page.locator('#shane-connected-status')).toContainText('revision was saved');
  await expect.poll(()=>page.evaluate(()=>window.__revisionCalls)).toEqual([{siteId:'11111111-1111-4111-8111-111111111111',request:'Please add a gallery of ceramic pieces'}]);
});

test('conversation revision does not execute without approval', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.__revisionCalls=[];
    window.confirm=()=>false;
    window.SHANEConversationStore={
      recentCreations:async()=>[{id:'11111111-1111-4111-8111-111111111111',type:'website',title:'Pottery studio',url:'builder.html?site=11111111-1111-4111-8111-111111111111'}],
      reviseSite:async args=>{window.__revisionCalls.push(args);return {saved:true}}
    };
  });
  await page.locator('#shane-connected-recent').click();
  await page.locator('#shaneIdeaReply').fill('Change the homepage title');
  await page.getByRole('button',{name:'Revise Pottery studio'}).click();
  await expect.poll(()=>page.evaluate(()=>window.__revisionCalls.length)).toBe(0);
});

test('conversation workspace carries a saved website into collaboration without losing the revision draft', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.SHANEConversationStore={
      recentCreations:async()=>[{id:'11111111-1111-4111-8111-111111111111',type:'website',title:'Pottery studio',url:'builder.html?site=11111111-1111-4111-8111-111111111111'}],
      joinedCollaborations:async()=>[{id:'22222222-2222-4222-8222-222222222222',status:'accepted',listingTitle:'Pottery fair',role:'collaborator',url:'workspace.html?collaboration=22222222-2222-4222-8222-222222222222'}]
    };
  });
  const vision='A pottery studio website with an exhibition and a community fair';
  const revision='Add a gallery for the exhibition and highlight collaborators';
  await page.locator('#visionPrompt').fill(vision);
  await page.locator('#shaneIdeaReply').fill(revision);
  await page.locator('#shane-connected-recent').click();
  await expect(page.locator('#shane-connected-creations')).toContainText('Pottery studio');
  await expect(page.locator('#shane-connected-collaborations')).toBeVisible();
  await page.locator('#shane-connected-collaborations').click();
  await expect(page.locator('#shane-connected-collaborations-list')).toContainText('Pottery fair');
  await expect(page.locator('#shane-connected-collaborations-list a').first()).toHaveAttribute('href',/workspace\.html\?collaboration=/);
  await expect(page.locator('#visionPrompt')).toHaveValue(vision);
  await expect(page.locator('#shaneIdeaReply')).toHaveValue(revision);
  await page.getByRole('button',{name:'Connections & messages'}).click();
  await expect(page.locator('#shane-connected-frame iframe')).toHaveAttribute('src',/my-network\.html/);
  await expect(page.locator('#visionPrompt')).toHaveValue(vision);
  await expect(page.locator('#shaneIdeaReply')).toHaveValue(revision);
});

test('connected conversation opens collaboration coordination and preserves drafted intent', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.SHANEConversationStore={
      joinedCollaborations:async()=>[{id:'11111111-1111-4111-8111-111111111111',status:'accepted',listingTitle:'Community makers event',role:'owner',url:'workspace.html?collaboration=11111111-1111-4111-8111-111111111111&endeavor=22222222-2222-4222-8222-222222222222'}]
    };
  });
  await page.locator('#visionPrompt').fill('Organize a community makers event');
  await page.locator('#shaneIdeaReply').fill('Invite ceramic artists and local musicians');
  await expect(page.locator('#shane-connected-collaborations')).toBeVisible();
  await page.locator('#shane-connected-collaborations').click();
  await expect(page.locator('#shane-connected-collaborations-list a').first()).toHaveAttribute('href',/collaboration=11111111/);
  await page.getByRole('button',{name:'Connections & messages'}).click();
  await expect(page.locator('#shane-connected-frame iframe')).toHaveAttribute('src',/my-network\.html/);
  await expect(page.locator('#visionPrompt')).toHaveValue('Organize a community makers event');
  await expect(page.locator('#shaneIdeaReply')).toHaveValue('Invite ceramic artists and local musicians');
});

test('accepted collaboration offers its private conversation and rejects pending links', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.SHANEConversationStore={
      joinedCollaborations:async()=>[
        {id:'11111111-1111-4111-8111-111111111111',status:'accepted',listingTitle:'Community fair',role:'collaborator',url:'workspace.html?collaboration=11111111-1111-4111-8111-111111111111'},
        {id:'22222222-2222-4222-8222-222222222222',status:'pending',listingTitle:'Pending invitation',role:'collaborator',url:'workspace.html?collaboration=22222222-2222-4222-8222-222222222222'}
      ]
    };
  });
  await expect(page.locator('#shane-connected-collaborations')).toBeVisible();
  await page.locator('#shane-connected-collaborations').click();
  const list=page.locator('#shane-connected-collaborations-list');
  await expect(list.getByRole('link',{name:'Private messages'})).toHaveAttribute('href','members.html?conversation=11111111-1111-4111-8111-111111111111#collaborationSection');
  await expect(list).not.toContainText('Pending invitation');
  await expect(list.locator('a')).toHaveCount(2);
});

test('collaboration and private messages remain inside creative workspace', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.SHANEConversationStore={joinedCollaborations:async()=>[{id:'11111111-1111-4111-8111-111111111111',status:'accepted',listingTitle:'Community makers event',role:'owner',url:'workspace.html?collaboration=11111111-1111-4111-8111-111111111111'}]};
  });
  await page.locator('#visionPrompt').fill('A welcoming neighborhood makers festival');
  await page.locator('#shaneIdeaReply').fill('Add a collaborative ceramics gallery');
  await expect(page.locator('#shane-connected-collaborations')).toBeVisible();
  await page.locator('#shane-connected-collaborations').click();
  const list=page.locator('#shane-connected-collaborations-list');
  await list.getByRole('link',{name:/Community makers event/}).click();
  await expect(page.locator('#shane-connected-frame iframe')).toHaveAttribute('src',/workspace\.html\?collaboration=11111111/);
  await list.getByRole('link',{name:'Private messages'}).click();
  await expect(page.locator('#shane-connected-frame iframe')).toHaveAttribute('src',/members\.html\?conversation=11111111/);
  await expect(page.locator('#visionPrompt')).toHaveValue('A welcoming neighborhood makers festival');
  await expect(page.locator('#shaneIdeaReply')).toHaveValue('Add a collaborative ceramics gallery');
});

test('named saved website opens beside the conversation and refreshes after approved revision', async ({ page }) => {
  const id='11111111-1111-4111-8111-111111111111';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(siteId => {
    window.SHANEConversationStore={
      recentCreations:async()=>{throw Error('Named search must not silently fall back to recent creations')},
      findSavedCreations:async({query})=>query==='pottery studio'?[{id:siteId,type:'website',title:'Pottery studio',url:'builder.html?site='+siteId}]:[],
      reviseSite:async({siteId:target,request})=>({saved:target===siteId&&request.includes('Add a gallery')})
    };
    window.confirm=()=>true;
  },id);
  await page.locator('#visionPrompt').fill('Create a welcoming pottery studio website');
  await page.locator('#shaneIdeaReply').fill('Find my website called Pottery Studio');
  await page.locator('#visionGuide').click();
  const link=page.locator('#shane-connected-creations a').first();
  await expect(link).toContainText('Pottery studio');
  await link.click();
  await expect(page.locator('#shane-connected-frame iframe')).toHaveAttribute('src',new RegExp('site='+id));
  await page.locator('#shaneIdeaReply').fill('Add a gallery for recent pottery projects');
  await page.locator('#shane-connected-creations button').filter({hasText:'Revise Pottery studio'}).click();
  await expect(page.locator('#shane-connected-status')).toContainText('revision was saved');
  await expect(page.locator('#visionPrompt')).toHaveValue('Create a welcoming pottery studio website');
  await expect(page.locator('#shaneIdeaReply')).toHaveValue('Add a gallery for recent pottery projects');
});

test('generic revision request never modifies a saved website', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(() => {
    window.__revisionCalls=0;
    window.SHANEConversationStore={
      recentCreations:async()=>[{id:'11111111-1111-4111-8111-111111111111',type:'website',title:'Pottery studio',url:'builder.html?site=11111111-1111-4111-8111-111111111111'}],
      reviseSite:async()=>{window.__revisionCalls++;return {saved:true}}
    };
    window.confirm=()=>true;
  });
  await page.locator('#visionPrompt').fill('Revise my website');
  await page.locator('#shane-connected-recent').click();
  await page.locator('#shane-connected-creations button').filter({hasText:'Revise Pottery studio'}).click();
  await expect(page.locator('#shane-connected-status')).toContainText('Describe what should change');
  expect(await page.evaluate(()=>window.__revisionCalls)).toBe(0);
});

test('revision cannot silently target a different website than the open preview', async ({ page }) => {
  const first='11111111-1111-4111-8111-111111111111';
  const second='22222222-2222-4222-8222-222222222222';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(([a,b])=>{
    window.__revisionCalls=0;
    window.SHANEConversationStore={
      recentCreations:async()=>[
        {id:a,type:'website',title:'Pottery studio',url:'builder.html?site='+a},
        {id:b,type:'website',title:'Community bakery',url:'builder.html?site='+b}
      ],
      reviseSite:async()=>{window.__revisionCalls++;return {saved:true}}
    };
    window.confirm=()=>true;
  },[first,second]);
  await page.locator('#visionPrompt').fill('Build a community makers network');
  await page.locator('#shaneIdeaReply').fill('Add a gallery to the homepage');
  await page.locator('#shane-connected-recent').click();
  await page.locator('#shane-connected-creations a').filter({hasText:'Pottery studio'}).click();
  await expect(page.locator('#shane-connected-frame iframe')).toHaveAttribute('src',new RegExp('site='+first));
  await page.locator('#shane-connected-creations button').filter({hasText:'Revise Community bakery'}).click();
  await expect(page.locator('#shane-connected-status')).toContainText('different website');
  expect(await page.evaluate(()=>window.__revisionCalls)).toBe(0);
  await expect(page.locator('#shaneIdeaReply')).toHaveValue('Add a gallery to the homepage');
});

test('conversation events retrieve saved work and accepted collaborations without losing the draft', async ({ page }) => {
  const id='11111111-1111-4111-8111-111111111111';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(collaborationId=>{
    window.SHANEConversationStore={
      recentCreations:async()=>[{id:collaborationId,type:'website',title:'Makers studio',url:'builder.html?site='+collaborationId}],
      joinedCollaborations:async()=>[{id:collaborationId,status:'accepted',role:'collaborator',listingTitle:'Makers event',url:'workspace.html?collaboration='+collaborationId}]
    };
  },id);
  await page.locator('#visionPrompt').fill('Create a welcoming makers event');
  await page.locator('#shaneIdeaReply').fill('Add a community gallery');
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('shane:conversation-network-intent',{detail:{kind:'saved-creations'}})));
  await expect(page.locator('#shane-connected-creations')).toContainText('Makers studio');
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('shane:conversation-network-intent',{detail:{kind:'collaborations'}})));
  await expect(page.locator('#shane-connected-collaborations-list')).toContainText('Makers event');
  await expect(page.locator('#visionPrompt')).toHaveValue('Create a welcoming makers event');
  await expect(page.locator('#shaneIdeaReply')).toHaveValue('Add a community gallery');
});

test('new endeavor save selects a confirmed identity before the next creation step', async ({ page }) => {
  const id='11111111-1111-4111-8111-111111111111';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(endeavorId=>{window.SHANEConversationStore={beginEndeavor:async()=>({id:endeavorId})}},id);
  await page.locator('#visionPrompt').fill('Create a neighborhood arts and makers collective');
  await page.locator('#shane-connected-save-vision').click();
  await expect(page.locator('#shane-connected-status')).toContainText('saved to your account and selected');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('shane-active-endeavor-v1')).id)).toBe(id);
});

test('unconfirmed endeavor save does not advance the active project context', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(()=>{sessionStorage.removeItem('shane-active-endeavor-v1');window.SHANEConversationStore={beginEndeavor:async()=>({})}});
  await page.locator('#visionPrompt').fill('Create a neighborhood arts and makers collective');
  await page.locator('#shane-connected-save-vision').click();
  await expect(page.locator('#shane-connected-status')).toContainText('save was not confirmed');
  expect(await page.evaluate(()=>sessionStorage.getItem('shane-active-endeavor-v1'))).toBeNull();
});

test('asynchronous creation planning waits for the proposal and still requires approval', async ({ page }) => {
  const id='11111111-1111-4111-8111-111111111111';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(endeavorId=>{
    sessionStorage.setItem('shane-active-endeavor-v1',JSON.stringify({id:endeavorId}));
    window.SHANEConversationStore={
      proposeCreationSequence:async({vision,endeavorId:id})=>({ready:true,steps:[{type:'new-website',vision,endeavorId:id}]}),
      executeApprovedSequence:async()=>{window.__creationExecutions=(window.__creationExecutions||0)+1;return {complete:true,verified:true,completed:[{type:'new-website'}]}}
    };
    window.__creationExecutions=0;
    window.confirm=()=>true;
  },id);
  await page.locator('#visionPrompt').fill('Build a pottery studio website');
  await page.locator('#shane-connected-plan').click();
  await expect(page.locator('#shane-connected-status')).toContainText('Creation plan: website');
  await expect(page.locator('#shane-connected-create')).toBeEnabled();
  expect(await page.evaluate(()=>window.__creationExecutions)).toBe(0);
  await page.locator('#shane-connected-create').click();
  await expect(page.locator('#shane-connected-status')).toContainText('Created and verified');
  expect(await page.evaluate(()=>window.__creationExecutions)).toBe(1);
});

test('asynchronous plan is discarded if the vision changes before planning completes', async ({ page }) => {
  const id='11111111-1111-4111-8111-111111111111';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(endeavorId=>{
    sessionStorage.setItem('shane-active-endeavor-v1',JSON.stringify({id:endeavorId}));
    window.SHANEConversationStore={proposeCreationSequence:()=>new Promise(resolve=>{window.__resolvePlan=resolve})};
  },id);
  await page.locator('#visionPrompt').fill('Create a makers studio website');
  await page.locator('#shane-connected-plan').click();
  await expect(page.locator('#shane-connected-status')).toContainText('Preparing');
  await page.locator('#visionPrompt').fill('Create a makers studio and neighborhood events');
  await page.evaluate(()=>window.__resolvePlan({ready:true,steps:[{type:'new-website'}]}));
  await expect(page.locator('#shane-connected-status')).toContainText('changed while planning');
  await expect(page.locator('#shane-connected-create')).toBeDisabled();
});

test('restoring the same vision text still invalidates an in-flight creation plan', async ({ page }) => {
  const id='11111111-1111-4111-8111-111111111111';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(endeavorId=>{
    sessionStorage.setItem('shane-active-endeavor-v1',JSON.stringify({id:endeavorId}));
    window.SHANEConversationStore={proposeCreationSequence:()=>new Promise(resolve=>{window.__resolvePlan=resolve})};
  },id);
  const original='Build a welcoming local makers website';
  await page.locator('#visionPrompt').fill(original);
  await page.locator('#shane-connected-plan').click();
  await expect(page.locator('#shane-connected-status')).toContainText('Preparing');
  await page.locator('#visionPrompt').fill('Build a makers website with events');
  await page.locator('#visionPrompt').fill(original);
  await page.evaluate(()=>window.__resolvePlan({ready:true,steps:[{type:'new-website'}]}));
  await expect(page.locator('#shane-connected-status')).toContainText('changed while planning');
  await expect(page.locator('#shane-connected-create')).toBeDisabled();
});

test('unsupported AI creation operation cannot enter the approval flow', async ({ page }) => {
  const id='11111111-1111-4111-8111-111111111111';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(endeavorId=>{
    sessionStorage.setItem('shane-active-endeavor-v1',JSON.stringify({id:endeavorId}));
    window.SHANEConversationStore={proposeCreationSequence:async()=>({ready:true,steps:[{type:'new-website'},{type:'unsupported-operation'}]})};
  },id);
  await page.locator('#visionPrompt').fill('Create a makers website and community');
  await page.locator('#shane-connected-plan').click();
  await expect(page.locator('#shane-connected-status')).toContainText('unsupported creation step');
  await expect(page.locator('#shane-connected-create')).toBeDisabled();
});

test('review shows the AI creation instructions and clears them when vision changes', async ({ page }) => {
  const id='11111111-1111-4111-8111-111111111111';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(endeavorId=>{
    sessionStorage.setItem('shane-active-endeavor-v1',JSON.stringify({id:endeavorId}));
    window.SHANEConversationStore={proposeAICreationSequence:async()=>({ready:true,steps:[{type:'new-website',vision:'Create a welcoming ceramics studio with an accessible events calendar',endeavorId}]})};
  },id);
  await page.locator('#visionPrompt').fill('Build a ceramics studio website');
  await page.locator('#shane-connected-plan').click();
  await expect(page.locator('#shane-connected-plan-review')).toContainText('accessible events calendar');
  await expect(page.locator('#shane-connected-create')).toBeEnabled();
  await page.locator('#visionPrompt').fill('Build a ceramics studio and community');
  await expect(page.locator('#shane-connected-plan-review')).toBeEmpty();
  await expect(page.locator('#shane-connected-create')).toBeDisabled();
});

test('AI-only planner can prepare a saved endeavor without the legacy keyword planner', async ({ page }) => {
  const id='11111111-1111-4111-8111-111111111111';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(endeavorId=>{
    sessionStorage.setItem('shane-active-endeavor-v1',JSON.stringify({id:endeavorId}));
    window.SHANEConversationStore={proposeAICreationSequence:async()=>({ready:true,steps:[{type:'new-website',vision:'Create an inviting community pottery studio website',endeavorId}],explanation:'A welcoming digital home first.'})};
  },id);
  await page.locator('#visionPrompt').fill('Help me launch a neighborhood pottery studio');
  await page.locator('#shane-connected-plan').click();
  await expect(page.locator('#shane-connected-plan-review')).toContainText('inviting community pottery studio');
  await expect(page.locator('#shane-connected-create')).toBeEnabled();
});

test('creation planning prioritizes the latest conversational refinement', async ({ page }) => {
  const id='11111111-1111-4111-8111-111111111111';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(endeavorId=>{
    sessionStorage.setItem('shane-active-endeavor-v1',JSON.stringify({id:endeavorId}));
    window.__planRequest=null;
    window.SHANEConversationStore={proposeAICreationSequence:async args=>{
      window.__planRequest=args;
      return {ready:true,steps:[{type:'new-website',vision:args.vision,endeavorId}]};
    }};
  },id);
  await page.locator('#visionPrompt').fill('Create a pottery studio website');
  await page.locator('#shaneIdeaReply').fill('Make the pottery studio accessible and include a class calendar');
  await page.locator('#shane-connected-plan').click();
  await expect(page.locator('#shane-connected-plan-review')).toContainText('class calendar');
  const planned=await page.evaluate(()=>window.__planRequest);
  expect(planned.vision).toContain('class calendar');
});

test('approval rejects an unreviewed conversational change even without an input event', async ({ page }) => {
  const id='11111111-1111-4111-8111-111111111111';
  await page.goto('http://127.0.0.1:8765/builder.html');
  await page.evaluate(endeavorId=>{
    sessionStorage.setItem('shane-active-endeavor-v1',JSON.stringify({id:endeavorId}));
    window.__executed=false;
    window.SHANEConversationStore={
      proposeAICreationSequence:async()=>({ready:true,steps:[{type:'new-website',vision:'Build a welcoming art studio website',endeavorId}]}),
      executeApprovedSequence:async()=>{window.__executed=true;return {complete:true,verified:true,completed:[]}}
    };
    window.confirm=()=>true;
  },id);
  await page.locator('#visionPrompt').fill('Build a welcoming art studio website');
  await page.locator('#shane-connected-plan').click();
  await expect(page.locator('#shane-connected-create')).toBeEnabled();
  await page.evaluate(()=>{document.querySelector('#shaneIdeaReply').value='Actually build a community instead';});
  await page.locator('#shane-connected-create').click();
  await expect(page.locator('#shane-connected-status')).toContainText('Review a fresh plan');
  expect(await page.evaluate(()=>window.__executed)).toBe(false);
});
