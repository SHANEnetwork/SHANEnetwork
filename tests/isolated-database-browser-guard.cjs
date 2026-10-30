'use strict';
// Browser acceptance tests must never send writes to the production SHANE database.
// Attach this guard before page.goto() for every real-database acceptance test.
const PROD_PROJECT = 'ufxzogeixdwvbpdypojb';
const TEST_PROJECT = 'veibqgfiactxchhdhgzt';
function isolatedDatabaseConfig(env = process.env) {
  const url = env.SHANE_TEST_SUPABASE_URL;
  const key = env.SHANE_TEST_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Isolated browser acceptance requires SHANE_TEST_SUPABASE_URL and SHANE_TEST_SUPABASE_ANON_KEY');
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.hostname !== TEST_PROJECT + '.supabase.co')
    throw new Error('Refusing browser acceptance outside the isolated SHANE Test project');
  return { url: parsed.origin, key };
}
async function guardAcceptancePage(page, config) {
  if (config.url !== 'https://' + TEST_PROJECT + '.supabase.co') throw new Error('Invalid isolated test project');
  await page.route('**/*', async route => {
    const requestUrl = route.request().url();
    if (requestUrl.includes(PROD_PROJECT + '.supabase.co'))
      return route.abort('blockedbyclient');
    return route.continue();
  });
  // The application currently hardcodes its production client. Tests must
  // explicitly substitute the test endpoint and key in a test-only response.
  // Never silently proceed against the hardcoded production configuration.
}
module.exports = { isolatedDatabaseConfig, guardAcceptancePage, PROD_PROJECT, TEST_PROJECT };
