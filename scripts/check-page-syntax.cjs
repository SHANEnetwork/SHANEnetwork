const fs = require('node:fs');
const vm = require('node:vm');
const pages = ['workspace.html', 'members.html', 'my-network.html', 'builder.html'];
let failures = 0;
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  let checked = 0;
  for (const [, attrs, code] of scripts) {
    if (/\bsrc\s*=/.test(attrs) || !code.trim()) continue;
    try {
      if (/\btype\s*=\s*["']module["']/i.test(attrs)) {
        const withoutImports = code.replace(/^\s*import\s*(?:\{[^}]*\}|\*\s+as\s+\w+|[\w$]+(?:\s*,\s*\{[^}]*\})?)\s*from\s*["'][^"']+["']\s*;?/gm, '');
        new vm.Script('(async()=>{\n' + withoutImports + '\n})()', { filename: page });
      } else {
        new vm.Script(code, { filename: page });
      }
      checked++;
    } catch (error) {
      console.error(page + ': ' + error.message);
      failures++;
    }
  }
  console.log(page + ': ' + checked + ' inline scripts checked');
}
if (failures) process.exitCode = 1;
