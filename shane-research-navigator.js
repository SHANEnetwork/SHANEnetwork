/* SHANE research navigator: user-directed links only, no profiling or background reports. */
(()=>{'use strict';
const byId=id=>document.getElementById(id);
const search=(query)=>'https://www.google.com/search?q='+encodeURIComponent(query);
const sources=[
 {title:'Official business registrations',description:'Locate the relevant state Secretary of State or corporate registry.',url:'https://www.usa.gov/state-government',query:name=>name+' official state business entity registry'},
 {title:'Professional license verification',description:'Find the applicable state licensing board and verify the license directly.',url:'https://www.usa.gov/state-government',query:name=>name+' professional licensing board verification'},
 {title:'Federal company filings',description:'Search SEC EDGAR for relevant registered-company filings.',url:'https://www.sec.gov/edgar/search/',query:name=>name+' site:sec.gov/Archives'},
 {title:'Federal consumer protection',description:'Check FTC guidance and published enforcement actions.',url:'https://www.ftc.gov/legal-library/browse/cases-proceedings',query:name=>name+' site:ftc.gov enforcement'},
 {title:'Consumer financial protection',description:'Check CFPB enforcement and public consumer information.',url:'https://www.consumerfinance.gov/enforcement/actions/',query:name=>name+' site:consumerfinance.gov enforcement'},
 {title:'Court and public records offices',description:'Find the court clerk or official records office with jurisdiction; access rules vary.',url:'https://www.usa.gov/state-government',query:name=>name+' official court clerk public records'},
 {title:'Independent published coverage',description:'Look for dated original reporting and confirm the entity is the same.',url:'https://news.google.com/',query:name+' organization news'}
];
function link(label,url){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label;return a}
function item(parent,title,description,url,query){const div=document.createElement('div');div.className='finding';const h=document.createElement('strong');h.textContent=title;const p=document.createElement('p');p.textContent=description;div.append(h,p,link('Open source',url));if(query){div.append(document.createTextNode(' · '),link('Search this source',search(query)))}parent.append(div)}
function run(){const name=byId('research-name').value.trim(),kind=byId('research-kind').value,place=byId('research-place').value.trim();const results=byId('research-results'),status=byId('research-status');results.replaceChildren();
if(!name){status.textContent='Enter an organization or public agency name to prepare research links.';return}
if(name.length<3){status.textContent='Enter at least three characters.';return}
if(kind==='person'){status.textContent='SHANE does not compile dossiers or screening reports about private individuals. For a particular transaction, use consent-based identity or credential verification through the appropriate official provider. No search has been performed.';item(results,'Official records guidance','Start with the government office relevant to the specific transaction. Do not use informal searches as employment, housing, credit or insurance eligibility screening.','https://www.usa.gov/state-government');return}
status.textContent='Prepared links only. SHANE has not visited these sites, confirmed any match, or evaluated the organization.';
for(const src of sources){const q=src.query(name)+(place?' '+place:'');item(results,src.title,src.description,src.url,q)}
const caution=document.createElement('p');caution.className='notice';caution.textContent='Search engines may return inaccurate, outdated or unrelated matches. Check the original record, its date, the exact organization identity and the relevant jurisdiction. No results are endorsements, accusations or background-check reports. Never use this page to make regulated eligibility decisions.';results.append(caution)
}
document.addEventListener('DOMContentLoaded',()=>{byId('research-go')?.addEventListener('click',run);byId('research-name')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run()}})});
})();