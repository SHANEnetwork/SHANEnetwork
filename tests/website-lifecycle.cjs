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

for (const name of ['builder.html', 'site.html', 'dashboard.html']) {
  const html = read(name);
  const ids = Array.from(html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi), match => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicateIds)], [], name + ' has duplicate element IDs');
  console.log('PASS ' + name + ': no duplicate HTML element IDs');
}

for (const name of ['builder.html', 'site.html', 'dashboard.html']) {
  const html = read(name);
  const ids = new Set(Array.from(html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi), match => match[1]));
  const references = [...Array.from(html.matchAll(/document\.getElementById\(["']([^"']+)["']\)/g), match => match[1]), ...Array.from(html.matchAll(/\$\(["']([^"']+)["']\)/g), match => match[1])];
  const missing = [...new Set(references.filter(id => !ids.has(id)))];
  assert.deepEqual(missing, [], name + ' references missing HTML element IDs');
  console.log('PASS ' + name + ': ' + references.length + ' direct DOM element references resolved');
}

assert.ok(builder.includes('if(selectedSiteId!==unpublishSiteId)'), 'Unpublish must cancel when the selected website changes');
console.log('PASS unpublish selection-change safeguard');

assert.ok(builder.includes('changed.id!==unpublishSiteId'), 'Unpublish must confirm the returned website ID');
console.log('PASS unpublish confirms the updated website');

assert.ok(builder.includes('data.id!==approvedSiteId'), 'Publishing must confirm the returned website ID before sharing the link');
assert.ok(builder.includes('websiteReadiness().filter(check=>!check.ok)'), 'Publishing must check editorial readiness');
console.log('PASS publication confirmation and readiness safeguards');

assert.ok(builder.includes('The website save could not be confirmed.'), 'New website saves must require a returned record');
assert.ok(builder.includes('The website copy could not be confirmed.'), 'Duplicating websites must require a returned record');
console.log('PASS new-site and duplicate confirmation safeguards');

const pageFiles = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const missingPageLinks = [];
for (const file of pageFiles) {
  const html = read(file);
  for (const match of html.matchAll(/\\bhref\\s*=\\s*["']([^"']+)["']/gi)) {
    const href = match[1].trim();
    if (!href || href.startsWith('#') || /^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    const pathname = href.split(/[?#]/)[0];
    if (!pathname || pathname.startsWith('/') || pathname.includes('\\u0024{')) continue;
    const destination = path.resolve(root, decodeURIComponent(pathname));
    if (!destination.startsWith(root + path.sep) || !fs.existsSync(destination)) {
      missingPageLinks.push(file + ' -> ' + href);
    }
  }
}
assert.deepEqual(missingPageLinks, [], 'Local navigation must not link to missing files');
console.log('PASS local navigation targets across ' + pageFiles.length + ' HTML pages');

for (const [file, required] of [
  ['builder.html', ['shane_sites', 'sb.auth.getUser()', 'status:"published",slug']],
  ['members.html', ['shane_profiles', 'shane_listings']],
  ['site.html', ['shane_sites', '.eq("status","published").maybeSingle()']]
]) {
  const source = read(file);
  for (const token of required) assert.ok(source.includes(token), file + ' is missing essential integration: ' + token);
}
console.log('PASS essential website and member backend integration markers');
