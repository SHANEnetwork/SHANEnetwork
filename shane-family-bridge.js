/* SHANE family integration contract. No cross-site account or private-data sharing. */
(()=>{"use strict";
const integrations=Object.freeze({
 shane:Object.freeze({label:"SHANE creation",url:"builder.html#vision-first",description:"Build and refine a personal endeavor"}),
 network:Object.freeze({label:"SHANE Network",url:"network.html",description:"Create and join shared endeavors without a personal website"}),
 shon:Object.freeze({label:"SHONnetwork",url:"https://shonnetwork.org",description:"Independent housing-focused network; separate accounts and data"})
});
function find(key){return Object.prototype.hasOwnProperty.call(integrations,key)?integrations[key]:null}
function startSharedEndeavor(text){
 const idea=String(text||"").trim();
 if(!idea)return false;
 if(idea.length>10000)throw new Error("Please shorten your idea to 10,000 characters.");
 const created=Date.now();
 try{
 sessionStorage.setItem("shane-shared-idea-draft-v2:personal",idea);
 sessionStorage.setItem("shane-creative-handoff-v1",JSON.stringify({text:idea,created}));
 sessionStorage.setItem("shane-intent-handoff-v1",JSON.stringify({destination:"builder.html",text:idea,endeavorId:null,created,origin:"network",visibility:"private"}));
 }catch(e){throw new Error("Your browser cannot save this draft. Please allow session storage before continuing.")}
 location.assign("builder.html#vision-first");
 return true;
}
window.SHANEFamily=Object.freeze({find,startSharedEndeavor,integrations});
})();
