const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../shane-endeavor-store.js');
test('requires authenticated client for endeavor listing', async () => {
  await assert.rejects(store.list({}), /authenticated Supabase client/i);
});
