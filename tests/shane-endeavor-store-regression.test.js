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
   },update(payload){
    assert.equal(JSON.parse(payload.plan).endeavorId,'created-123');
    return {eq(){return this;},select(){return this;},single:async()=>({data:{id:'created-123',owner_id:'alice',plan:payload.plan},error:null})};
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

test('failed canonicalization returns the created ID for recovery',async()=>{
 const spec=require('../shane-composition.js').compose({endeavorId:'unsaved-draft',title:'Recovery',modules:['pages']});
 const client={auth:{getUser:async()=>({data:{user:{id:'alice'}},error:null})},from(){
  return {insert(payload){return {select(){return {single:async()=>({data:{id:'created-456',owner_id:'alice',title:payload.title,idea:payload.idea},error:null})}}};},
   update(){return {eq(){return this;},select(){return this;},single:async()=>({data:null,error:{message:'write failed'}})};}
  };
 }};
 await assert.rejects(store.save(client,{vision:'Recover project',spec}),err=>{
  assert.equal(err.endeavorId,'created-456');
  assert.equal(err.recoverable,true);
  return /canonical identity persistence failed/i.test(err.message);
 });
});

test('recovery rejects unauthenticated access',async()=>{
 await assert.rejects(store.recover({},'created-123'),/authenticated Supabase client/i);
});
test('recovery refuses a missing endeavor identifier',async()=>{
 const client={auth:{getUser:async()=>({data:{user:{id:'alice'}},error:null})},from(){throw Error('Database must not be queried');}};
 await assert.rejects(store.recover(client,''),/Endeavor ID required/);
});

test('automatic recovery retries the original endeavor rather than inserting a duplicate',async()=>{
 const compose=require('../shane-composition.js').compose;
 const spec=compose({endeavorId:'unsaved-draft',title:'Continuity',modules:['pages']});
 let writes=0,inserts=0,storedPlan;
 const row={id:'new-id',owner_id:'alice',title:'Continuity',idea:'Build it',linked_site_id:null};
 const client={auth:{getUser:async()=>({data:{user:{id:'alice'}},error:null})},from(){
  let operation='read',payload=null;
  const query={
   select(){return this;},eq(){return this;},
   insert(p){inserts++;operation='insert';payload=p;return this;},
   update(p){operation='update';payload=p;return this;},
   async single(){
    if(operation==='insert'){storedPlan=payload.plan;return {data:{...row,plan:storedPlan},error:null};}
    if(operation==='update'){writes++;if(writes===1)return {data:null,error:{message:'temporary failure'}};storedPlan=payload.plan;return {data:{...row,plan:storedPlan},error:null};}
    return {data:{...row,plan:storedPlan},error:null};
   }
  };
  return query;
 }};
 const saved=await store.save(client,{spec,vision:'Build it'});
 assert.equal(inserts,1);
 assert.equal(writes,2);
 assert.equal(saved.id,'new-id');
 assert.equal(saved.spec.endeavorId,'new-id');
 assert.equal(JSON.parse(storedPlan).endeavorId,'new-id');
});

test('a saved endeavor identity cannot be accidentally inserted as a new project',async()=>{
 const spec=require('../shane-composition.js').compose({endeavorId:'existing-id',title:'Existing',modules:['pages']});
 const client={auth:{getUser:async()=>({data:{user:{id:'alice'}},error:null})},from(){throw Error('Must not reach database');}};
 await assert.rejects(store.save(client,{spec,vision:'Keep original'}),/unsaved draft identity/i);
});

test('loads a JSONB endeavor plan without requiring a serialized string',async()=>{
 const spec=require('../shane-composition.js').compose({endeavorId:'saved-id',title:'Stored',modules:['pages']});
 const client={auth:{getUser:async()=>({data:{user:{id:'alice'}},error:null})},from(){
  return {select(){return this;},eq(){return this;},single:async()=>({data:{id:'saved-id',owner_id:'alice',title:'Stored',idea:'Build it',plan:{...spec,conversation:[{role:'you',text:'Remember this'}]},linked_site_id:null},error:null})};
 }};
 const saved=await store.load(client,'saved-id');
 assert.equal(saved.spec.endeavorId,'saved-id');
 assert.deepEqual(saved.conversation,[{role:'you',text:'Remember this'}]);
 assert.equal(saved.canEdit,true);
});
