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

/*
 * SHANE journey contracts: fail CI if the essential conversation-to-network
 * handoffs are accidentally removed. These are static integration guards,
 * not substitutes for authenticated two-member browser tests.
 */
const contracts = [
  ['index.html', [
    ['welcome vision form', 'id="shaneWelcome"'],
    ['welcome to creator handoff', 'builder.html?from=welcome#vision-first']
  ]],
  ['builder.html', [
    ['welcome draft recovery', 'shane-welcome-v1'],
    ['account endeavor persistence', 'sb.from("shane_endeavors").insert(payload)'],
    ['saved endeavor vision recovery', 'visionField.value=data.idea.slice(0,12000)'],
    ['latest endeavor vision recovery', 'latestVision.value=(data.idea||"").slice(0,12000)'],
    ['vision-first creation prompt', 'id="visionPrompt"']
  ]],
  ['my-network.html', [
    ['conversation-first return', 'continueLink.textContent="Continue the conversation"'],
    ['saved endeavor context', 'continueLink.href="builder.html?endeavor="'],
    ['network listing handoff', 'shane-network-draft-v1']
  ]],
  ['workspace.html', [
    ['collaboration messages', 'shane_collaboration_messages'],
    ['collaboration tasks', 'shane_collaboration_tasks'],
    ['collaboration activity', 'shane_collaboration_activity'],
    ['live feed refresh', 'setInterval(refreshLiveFeeds, 30000)']
  ]],
  ['members.html', [
    ['network draft recovery', 'shane-network-draft-v1']
  ]]
];
for (const [page, requirements] of contracts) {
  if (!fs.existsSync(page)) continue;
  const source = fs.readFileSync(page, 'utf8');
  for (const [label, marker] of requirements) {
    if (!source.includes(marker)) {
      console.error(page + ': missing journey contract: ' + label);
      failures++;
    } else {
      console.log(page + ': journey contract OK: ' + label);
    }
  }
}
if (failures) process.exitCode = 1;
