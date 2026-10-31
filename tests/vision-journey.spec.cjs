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
