const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const builder = read('builder.html');
const dashboard = read('dashboard.html');
const publicSite = read('site.html');
const cases = [
  ['new private website creation', builder.includes('shane_sites").insert({owner_id:user.id') && builder.includes('status:"draft"')],
  ['saved website owner-scoped updates', builder.includes('shane_sites").update(') && builder.includes('.eq("owner_id",user.id)')],
  ['publication requires a saved website', builder.includes('Save the website to your account before publishing.')],
  ['publication requires explicit review', builder.includes('confirmPublicContent') && builder.includes('reviewStillValid()')],
  ['publication writes published status', builder.includes('status:"published",slug')],
  ['public website only fetches published records', publicSite.includes('.eq("status","published").maybeSingle()')],
  ['public website uses escaped text rendering', publicSite.includes('p.textContent=pages[n].body')],
  ['dashboard provides published website links', dashboard.includes('site.html?slug=')],
  ['save handles auth failures', builder.includes('Could not verify your account: "+authError.message')],
  ['dashboard refresh guarded', dashboard.includes('dashboardLoadInProgress=true') && dashboard.includes('dashboardLoadInProgress=false')],
];
for (const [name, passed] of cases) console.log((passed ? 'PASS' : 'FAIL') + ' ' + name);
assert.equal(cases.filter(([, passed]) => !passed).length, 0, 'Website lifecycle contract regression');
console.log('All ' + cases.length + ' static website lifecycle checks passed.');

const { spawnSync } = require('node:child_process');
for (const name of ['builder.html', 'site.html', 'dashboard.html']) {
  const html = read(name);
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length, name + ' must include scripts');
  let checked = 0;
  for (const [, attributes, source] of scripts) {
    if (!source.trim()) continue;
    const isModule = /\btype\s*=\s*["']module["']/i.test(attributes);
    const result = spawnSync(process.execPath, [
      '--check', '--input-type=' + (isModule ? 'module' : 'commonjs')
    ], { input: source, encoding: 'utf8' });
    checked++;
    assert.equal(result.status, 0,
      name + ' inline script ' + checked + ' syntax error:\n' + result.stderr);
  }
  console.log('PASS ' + name + ': ' + checked + ' inline JavaScript scripts parse');
}
