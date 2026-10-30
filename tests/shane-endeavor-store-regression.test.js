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

test('new endeavor save returns real identity and owner permissions',async()=>{
 const spec=require('../shane-composition.js').compose({endeavorId:'unsaved-draft',title:'New Project',modules:['pages']});
 const client={
  auth:{getUser:async()=>({data:{user:{id:'alice'}},error:null})},
  from(table){
   assert.equal(table,'shane_endeavors');
   return {insert(payload){
    assert.equal(payload.owner_id,'alice');
    return {select(){return {single:async()=>({data:{id:'created-123',owner_id:'alice',title:payload.title,idea:payload.idea},error:null})}}};
   }};
  }
 };
 const saved=await store.save(client,{title:'New Project',vision:'Build a site',spec,conversation:[{role:'you',text:'Build a site'}]});
 assert.equal(saved.id,'created-123');
 assert.equal(saved.spec.endeavorId,'created-123');
 assert.equal(saved.accessRole,'owner');
 assert.equal(saved.canEdit,true);
 assert.deepEqual(saved.conversation,[{role:'you',text:'Build a site'}]);
});
