/* SHANE Detangler acquisition and independent arithmetic v1.
 * Explicitly authorized public HTTPS sites only. No credentials, writes or CAD certification.
 * Network adapter is injected for deterministic tests and restricted deployments.
 */
'use strict';
const MAX_PAGES=30, MAX_BYTES=300000, MAX_LINKS=200;
function normalizeUrl(raw,base){
 try {const u=new URL(raw,base);if(u.protocol!=='https:')return null;
 u.hash='';u.username='';u.password='';return u.href;}catch{return null;}
}
function extractLinks(html,base){
 const result=[],re=/<(?:a|link|script|img)\b[^>]*?\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
 for(const m of html.matchAll(re)){const url=normalizeUrl(m[1],base);if(url)result.push(url);if(result.length>=MAX_LINKS)break;}return [...new Set(result)];
}
async function crawlPublicSite({startUrl,fetcher,authorizedHosts,maxPages=MAX_PAGES}={}){
 if(typeof fetcher!=='function')throw Error('An authorized network fetch adapter is required');
 const start=normalizeUrl(startUrl);if(!start)throw Error('HTTPS start URL required');
 const hosts=new Set((authorizedHosts||[]).map(x=>String(x).toLowerCase()));
 if(!hosts.has(new URL(start).hostname))throw Error('Host must be explicitly authorized');
 const limit=Math.max(1,Math.min(MAX_PAGES,Number(maxPages)||MAX_PAGES)),queue=[start],seen=new Set(),pages=[],links=[],errors=[];
 while(queue.length&&pages.length<limit){
  const url=queue.shift();if(seen.has(url))continue;seen.add(url);
  if(!hosts.has(new URL(url).hostname))continue;
  try{
   const response=await fetcher(url,{redirect:'manual',credentials:'omit'});
   const status=Number(response.status);
   if(status>=300&&status<400){errors.push({url,status,kind:'redirect-unverified',location:response.headers?.get?.('location')||''});continue;}
   if(!response.ok){errors.push({url,status,kind:status===401||status===403?'inaccessible-document':'broken-link'});continue;}
   const type=response.headers?.get?.('content-type')||'';
   if(!/text\/html/i.test(type)){pages.push({url,status,contentType:type,linkCount:0});continue;}
   const html=String(await response.text()).slice(0,MAX_BYTES);
   const found=extractLinks(html,url);
   pages.push({url,status,contentType:type,linkCount:found.length});
   for(const target of found){links.push({from:url,to:target,internal:hosts.has(new URL(target).hostname)});if(hosts.has(new URL(target).hostname)&&!seen.has(target)&&!queue.includes(target))queue.push(target);}
  }catch(e){errors.push({url,kind:'fetch-error',detail:String(e?.message||e).slice(0,200)});}
 }
 return {schema:'shane.detangler.public-crawl',version:1,startUrl:start,authorizedHosts:[...hosts],pages,links,errors,remainingQueue:queue.length,complete:queue.length===0,networkReadOnly:true,sourceContentIncluded:false};
}
function checkCalculations(checks){
 if(!Array.isArray(checks))throw Error('Checks must be an array');
 return checks.map((c,i)=>{
  const id=String(c.id||'C'+(i+1)),op=c.operation,values=c.inputs;
  if(!Array.isArray(values)||!values.length||!values.every(x=>typeof x==='number'&&Number.isFinite(x)))throw Error('Finite numeric inputs required: '+id);
  let result;
  if(op==='sum')result=values.reduce((a,b)=>a+b,0);
  else if(op==='product')result=values.reduce((a,b)=>a*b,1);
  else if(op==='divide'&&values.length===2&&values[1]!==0)result=values[0]/values[1];
  else if(op==='subtract'&&values.length===2)result=values[0]-values[1];
  else throw Error('Unsupported operation or zero denominator: '+id);
  const expected=typeof c.expected==='number'&&Number.isFinite(c.expected)?c.expected:null;
  const tolerance=typeof c.tolerance==='number'&&Number.isFinite(c.tolerance)&&c.tolerance>=0?c.tolerance:0;
  return {id,operation:op,inputs:values,result,unit:String(c.unit||''),sourceRef:String(c.sourceRef||''),expected,tolerance,withinTolerance:expected===null?null:Math.abs(result-expected)<=tolerance,engineeringVerified:false,interpretation:'Arithmetic only; units, assumptions and equipment performance require independent validation'};
 });
}
module.exports={normalizeUrl,extractLinks,crawlPublicSite,checkCalculations};
