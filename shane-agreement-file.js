/* Local document import for the preliminary agreement phrase checker. */
(()=>{'use strict';document.addEventListener('DOMContentLoaded',()=>{
const fileInput=document.getElementById('agreement-file'),agreement=document.getElementById('agreement'),status=document.getElementById('status');
if(!fileInput||!agreement)return;
fileInput.addEventListener('change',async()=>{
const file=fileInput.files?.[0];if(!file)return;
if(!/\.txt$/i.test(file.name)||file.size>200000){status.textContent='Choose a .txt file smaller than 200 KB. No file was loaded.';fileInput.value='';return}
if(agreement.value.trim()&&!confirm('Replace the text currently in the agreement box?')){fileInput.value='';return}
try{const text=await file.text();agreement.value=text.slice(0,100000);status.textContent='Text loaded locally. Select Examine the agreement to run the preliminary phrase checks. Nothing was uploaded.'}
catch{status.textContent='Unable to read that file.'}
fileInput.value='';
});
});})();