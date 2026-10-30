const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../shane-endeavor-store.js');
test('requires authenticated client for endeavor listing', async () => {
  await assert.rejects(store.list({}), /authenticated Supabase client/i);
});

function fakeClient(userId, endeavors, memberships) {
 return {
  auth:{getUser:async()=>({data:{user:{id:userId}},error:null})},
  from(table){
   const source=table==='shane_endeavors'?endeavors:memberships;
   const filters=[];
   const q={
    select(){return this;},
    eq(field,value){filters.push([field,value]);return this;},
    order(){return this;},
    limit(){return Promise.resolve({data:source.filter(row=>filters.every(([key,value])=>row[key]===value)),error:null});}
   };
   return q;
  }
 };
}
test('lists owned and accepted shared endeavors with distinct permissions',async()=>{
 const rows=[{id:'mine',owner_id:'alice',title:'Mine'},{id:'shared',owner_id:'bob',title:'Shared'}];
 const members=[{endeavor_id:'shared',user_id:'alice',status:'active'}];
 const items=await store.list(fakeClient('alice',rows,members));
 assert.equal(items.length,2);
 assert.equal(items[0].accessRole,'owner');
 assert.equal(items[0].canEdit,true);
 assert.equal(items[1].accessRole,'collaborator');
 assert.equal(items[1].canEdit,false);
});
test('excludes revoked shared endeavor even if supplied by an overbroad query',async()=>{
 const rows=[{id:'shared',owner_id:'bob',title:'Shared'}];
 const members=[{endeavor_id:'shared',user_id:'alice',status:'revoked'}];
 const items=await store.list(fakeClient('alice',rows,members));
 assert.deepEqual(items,[]);
});
