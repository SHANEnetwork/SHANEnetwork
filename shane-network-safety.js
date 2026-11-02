/* Safety utilities: browser-only, no automatic upload or reporting. */
(()=>{'use strict';document.addEventListener('DOMContentLoaded',()=>{
const $=id=>document.getElementById(id),notes=$('incident-notes'),status=$('incident-status');
$('safety-reset')?.addEventListener('click',()=>{document.querySelectorAll('.safety-check').forEach(c=>c.checked=false)});
$('incident-clear')?.addEventListener('click',()=>{notes.value='';status.textContent='Notes cleared from this page.'});
$('incident-export')?.addEventListener('click',()=>{
const value=notes.value.trim();if(!value){status.textContent='Enter notes before downloading.';return}
const blob=new Blob(['Private concern notes - user-authored, not verified by SHANE\nExported: '+new Date().toISOString()+'\n\n'+value],{type:'text/plain;charset=utf-8'});
const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='shane-private-concern-notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Downloaded notes to your device. Check where your browser saved the file.';
});
});})();