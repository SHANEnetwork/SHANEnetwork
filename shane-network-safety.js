/* Safety utilities: browser-only, no automatic upload or reporting. */
(()=>{'use strict';document.addEventListener('DOMContentLoaded',()=>{
const $=id=>document.getElementById(id),notes=$('incident-notes'),status=$('incident-status');
const params=new URLSearchParams(location.search),endeavor=(params.get('endeavor')||'').slice(0,180),category=(params.get('category')||'').slice(0,80),region=(params.get('region')||'').slice(0,120);if(endeavor){const name=$('research-name'),party=$('party');if(name&&!name.value)name.value=endeavor;if(party&&!party.value)party.value=endeavor;const info=document.createElement('p');info.className='notice';info.textContent='Research context: '+endeavor+(category?' · '+category:'')+(region?' · '+region:'')+'. This is not a warning or finding about this endeavor. No search or screening has been performed.';const heading=$('research-heading');heading?.parentElement?.insertBefore(info,heading.nextSibling)}
$('safety-reset')?.addEventListener('click',()=>{document.querySelectorAll('.safety-check').forEach(c=>c.checked=false)});
$('incident-clear')?.addEventListener('click',()=>{notes.value='';status.textContent='Notes cleared from this page.'});
$('incident-export')?.addEventListener('click',()=>{
const value=notes.value.trim();if(!value){status.textContent='Enter notes before downloading.';return}
const blob=new Blob(['Private concern notes - user-authored, not verified by SHANE\nExported: '+new Date().toISOString()+(endeavor?'\nEndeavor context (user-selected, not verified): '+endeavor:'')+'\n\n'+value],{type:'text/plain;charset=utf-8'});
const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='shane-private-concern-notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Downloaded notes to your device. Check where your browser saved the file.';
});
});})();