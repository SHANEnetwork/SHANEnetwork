const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const pages = ['index.html', 'workspace.html', 'members.html', 'my-network.html', 'builder.html', 'site.html', 'dashboard.html', 'network.html'];
let failures = 0;
for (const page of pages) {
  if (!fs.existsSync(page)) { console.error(page + ': required page is missing'); failures++; continue; }
  const html = fs.readFileSync(page, 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  let checked = 0;
  for (const [, attrs, code] of scripts) {
    if (/\bsrc\s*=/.test(attrs) || !code.trim()) continue;
    if (/\btype\s*=\s*["'](?:application\/json|application\/ld\+json|importmap)["']/i.test(attrs)) continue;
    const isModule = /\btype\s*=\s*["']module["']/i.test(attrs);
    const result = spawnSync(process.execPath, ['--check', '--input-type=' + (isModule ? 'module' : 'commonjs')], {
      input: code, encoding: 'utf8'
    });
    if (result.status !== 0) {
      const line = html.slice(0, html.indexOf(code)).split('\n').length;
      console.error(page + ' inline script near line ' + line + ': ' + (result.stderr || result.error?.message || 'syntax check failed'));
      failures++;
    } else {
      checked++;
    }
  }
  console.log(page + ': ' + checked + ' inline scripts checked');
}
if (failures) process.exitCode = 1;
