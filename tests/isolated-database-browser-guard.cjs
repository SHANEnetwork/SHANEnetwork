'use strict';
// Fail-closed routing for browser acceptance against the isolated SHANE Test project.
const PROD_PROJECT = 'ufxzogeixdwvbpdypojb';
const TEST_PROJECT = 'veibqgfiactxchhdhgzt';
const PROD_URL = 'https://' + PROD_PROJECT + '.supabase.co';
const TEST_URL = 'https://' + TEST_PROJECT + '.supabase.co';
function isolatedDatabaseConfig(env = process.env) {
  const url = env.SHANE_TEST_SUPABASE_URL;
  const key = env.SHANE_TEST_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Isolated acceptance requires SHANE_TEST_SUPABASE_URL and SHANE_TEST_SUPABASE_ANON_KEY');
  const parsed = new URL(url);
  if (parsed.origin !== TEST_URL || parsed.pathname !== '/' || parsed.search || parsed.hash)
    throw new Error('Refusing browser acceptance outside the isolated SHANE Test project');
  if (!/^sb_publishable_|^eyJ/.test(key)) throw new Error('Expected a Supabase publishable/anon key');
  return {url: TEST_URL, key};
}
async function guardAcceptancePage(page, config) {
  if (!config || config.url !== TEST_URL || !config.key) throw new Error('Invalid isolated test configuration');
  await page.route('**/*', async route => {
    const url = route.request().url();
    if (url.startsWith(PROD_URL)) return route.abort('blockedbyclient');
    const pathname = new URL(url).pathname;
    if (!/\/(?:builder|site|members|dashboard|workspace|my-network)\.html$/.test(pathname))
      return route.continue();
    const response = await route.fetch();
    if (!response.ok()) return route.fulfill({response});
    const html = await response.text();
    // Fail closed if the application no longer contains the expected configuration.
    if (!html.includes(PROD_URL)) throw new Error('Expected production client marker missing from ' + pathname);
    const replaced = html.replaceAll(PROD_URL, TEST_URL)
      .replaceAll('sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB', config.key);
    if (replaced.includes(PROD_URL)) throw new Error('Production endpoint remains in test HTML');
    return route.fulfill({response,body:replaced,headers:{...response.headers(),'cache-control':'no-store'}});
  });
}
module.exports = {isolatedDatabaseConfig,guardAcceptancePage,PROD_PROJECT,TEST_PROJECT};
