const {test}=require('node:test'),assert=require('node:assert/strict');
const {crawlPublicSite,checkCalculations,extractLinks}=require('../shane-detangler-acquisition.cjs');
test('bounded public crawl stays on authorized host and classifies failures',async()=>{
 const pages={'https://example.org/':['<a href="/next">Next</a><a href="https://other.org/private">Outside</a>',200],
 'https://example.org/next':['Missing',404]};
 const fetcher=async url=>{const [body,status]=pages[url]||['',404];return {status,ok:status===200,headers:{get:k=>k==='content-type'?'text/html':null},text:async()=>body};};
 const r=await crawlPublicSite({startUrl:'https://example.org/',authorizedHosts:['example.org'],fetcher});
 assert.equal(r.pages.length,1);assert.equal(r.errors[0].kind,'broken-link');assert.ok(r.links.some(x=>x.internal===false));assert.equal(r.sourceContentIncluded,false);
});
test('requires explicit authorization and HTTPS',async()=>{await assert.rejects(()=>crawlPublicSite({startUrl:'http://example.org',authorizedHosts:['example.org'],fetcher:async()=>{}}));await assert.rejects(()=>crawlPublicSite({startUrl:'https://example.org',authorizedHosts:['other.org'],fetcher:async()=>{}}))});
test('does not follow redirects to other hosts',async()=>{const r=await crawlPublicSite({startUrl:'https://example.org',authorizedHosts:['example.org'],fetcher:async()=>({status:302,ok:false,headers:{get:()=> 'https://other.org'},text:async()=>''})});assert.equal(r.errors[0].kind,'redirect-unverified')});
test('calculates Trinity planning throughput without asserting engineering verification',()=>{const r=checkCalculations([{id:'water',operation:'divide',inputs:[30000000,8000],unit:'gallons/hour',expected:3750,sourceRef:'planning basis'}]);assert.equal(r[0].result,3750);assert.equal(r[0].withinTolerance,true);assert.equal(r[0].engineeringVerified,false)});
test('detects arithmetic discrepancy and invalid division',()=>{const r=checkCalculations([{operation:'product',inputs:[4,5],expected:21}]);assert.equal(r[0].withinTolerance,false);assert.throws(()=>checkCalculations([{operation:'divide',inputs:[1,0]}]))});
test('extracts bounded links and drops non-HTTPS',()=>{const r=extractLinks('<a href="mailto:a@b.com">x</a><a href="/one">one</a>','https://example.org');assert.deepEqual(r,['https://example.org/one'])});
