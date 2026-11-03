// Regression contract for endeavor save idempotency. Run with Node.
// Source assertions only; two-account and browser verification remain required.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','builder.html'),'utf8');
const begin=html.indexOf('let endeavorAccountSaveInFlight=false;');
const end=html.indexOf('document.getElementById("loadEndeavorAccount")',begin);
assert(begin>=0&&end>begin,'save handler exists');
const handler=html.slice(begin,end);
const lock=handler.indexOf('endeavorAccountSaveInFlight=true');
const auth=handler.indexOf('await sb.auth.getUser()');
assert(lock>=0&&auth>lock,'save locks before async auth');
assert(handler.includes('if(endeavorAccountSaveInFlight)return'),'duplicate invocation exits');
assert(handler.includes('endeavorAccountSaveInFlight=false;\n  saveButton.disabled=false;'),'finally releases lock');
assert(handler.includes('.insert(payload).select("id").single()'),'new endeavor saves through account');
assert(handler.includes('shane:endeavor-account-saved'),'successful save emits continuity event');
console.log('Endeavor save source-contract assertions passed; runtime tests still required.');
