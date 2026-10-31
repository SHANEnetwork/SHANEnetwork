const assert=require("node:assert/strict");
const network=require("../shane-network-connector.js");
const owner="member-1";
const endeavors=[{id:"endeavor-a",title:"A shared endeavor",status:"draft",created_at:"2026-10-30"}];
const listings=[{id:"listing-a",title:"A public doorway",status:"published",endeavor_id:"endeavor-a",website_url:"https://example.org",created_at:"2026-10-30"},{id:"listing-b",title:"Independent opportunity",status:"draft",endeavor_id:null,website_url:null,created_at:"2026-10-30"}];
const calls=[];
function table(name){
 const state={name,filters:[]};
 const q={
 select(){return q},eq(field,value){state.filters.push([field,value]);return q},
 order(){return q},limit(){calls.push(state);return Promise.resolve({data:name==="shane_endeavors"?endeavors:listings,error:null})}
 };
 return q;
}
const client={auth:{getUser:async()=>({data:{user:{id:owner}},error:null})},from:table};
(async()=>{
 const result=await network.myNetworkOverview(client);
 assert.equal(result.endeavors.length,1);
 assert.equal(result.endeavors[0].networkListings[0].id,"listing-a");
 assert.equal(result.standaloneListings[0].id,"listing-b");
 assert.equal(result.truncated,false);
 assert.equal(calls.length,2);
 assert(calls.every(c=>c.filters.some(([field,value])=>field==="owner_id"&&value===owner)));
 await assert.rejects(()=>network.myNetworkOverview({auth:{getUser:async()=>({data:{user:null}}),},from:table}),/Sign in/);
 console.log("SHANE owner-scoped endeavor and network overview contracts passed");
})().catch(e=>{console.error(e);process.exitCode=1});
