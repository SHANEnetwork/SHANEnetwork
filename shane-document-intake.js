/* Local, consent-first document intake for SHANE Creator.
   Text-based formats are read in-browser; unsupported binary documents are not falsely represented as analyzed. */
(function(){
"use strict";
const LIMIT=8*1024*1024,MAX_TOTAL=1200000;
function init(){
 const zone=document.getElementById("shane-document-drop"),input=document.getElementById("shane-document-files"),status=document.getElementById("shane-document-status"),reply=document.getElementById("shaneIdeaReply"),prompt=document.getElementById("visionPrompt"),list=document.getElementById("shane-document-list");
 if(!zone||!input||!reply||!status||!list)return;
 const readable=/\.(txt|md|markdown|csv|tsv|json|html?|xml|css|js|log|yaml|yml|sql|rtf)$/i;
 let total=0;
 async function ingest(files){
  for(const file of Array.from(files||[])){
   if(!readable.test(file.name)){status.textContent="“"+file.name+"” is not a directly readable text file. PDF, Word and other binary formats need a document extraction service before SHANE can analyze them.";continue;}
   if(file.size>LIMIT){status.textContent="“"+file.name+"” is over the 8 MB per-file browser reading limit.";continue;}
   if(total+file.size>MAX_TOTAL){status.textContent="These files exceed the current 1.2 MB combined text intake limit. Add fewer or smaller files.";continue;}
   try{
    const content=await file.text();
    if(content.includes("\0")){status.textContent="“"+file.name+"” contains binary data and was not added.";continue;}
    const destination=reply.value.trim()?reply:(!prompt.value.trim()?prompt:reply);
    const text="\n\n[Document: "+file.name+"]\n"+content+"\n[End document: "+file.name+"]";
    destination.value+=text;
    destination.dispatchEvent(new Event("input",{bubbles:true}));
    total+=file.size;
    const item=document.createElement("li");item.textContent=file.name+" (added to your private draft)";list.appendChild(item);
    status.textContent="Document text added to your private draft. Review it before sending anything to an AI service.";
   }catch{status.textContent="Could not read “"+file.name+"”. Your other writing has been preserved.";}
  }
  input.value="";
 }
 input.addEventListener("change",()=>ingest(input.files));
 zone.addEventListener("dragover",event=>{if(!event.dataTransfer?.types?.includes("Files"))return;event.preventDefault();zone.classList.add("is-dragging");});
 zone.addEventListener("dragleave",()=>zone.classList.remove("is-dragging"));
 zone.addEventListener("drop",event=>{event.preventDefault();zone.classList.remove("is-dragging");ingest(event.dataTransfer.files);});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
