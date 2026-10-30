'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {isolatedDatabaseConfig,guardAcceptancePage}=require('./isolated-database-browser-guard.cjs');
const testUrl='https://veibqgfiactxchhdhgzt.supabase.co';
const prodUrl='https://ufxzogeixdwvbpdypojb.supabase.co';
const prodKey='sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB';
test('isolated configuration rejects missing and production credentials',()=>{
 assert.throws(()=>isolatedDatabaseConfig({}),/requires/);
 assert.throws(()=>isolatedDatabaseConfig({SHANE_TEST_SUPABASE_URL:prodUrl,SHANE_TEST_SUPABASE_ANON_KEY:'sb_publishable_test'}),/Refusing/);
 assert.equal(isolatedDatabaseConfig({SHANE_TEST_SUPABASE_URL:testUrl,SHANE_TEST_SUPABASE_ANON_KEY:'sb_publishable_test'}).url,testUrl);
});
test('acceptance browser substitutes test endpoint and blocks production requests',async()=>{
 let handler;
 const page={route:async(_pattern,fn)=>{handler=fn}};
 await guardAcceptancePage(page,{url:testUrl,key:'sb_publishable_test'});
 const source='<script>createClient("'+prodUrl+'","'+prodKey+'")</script>';
 let fulfilled;
 await handler({request:()=>({url:()=> 'http://localhost:8080/builder.html'}),fetch:async()=>({ok:()=>true,text:async()=>source,headers:()=>({'content-type':'text/html'})}),fulfill:async args=>{fulfilled=args}});
 assert.match(fulfilled.body,/veibqgfiactxchhdhgzt/);
 assert.match(fulfilled.body,/sb_publishable_test/);
 assert.doesNotMatch(fulfilled.body,/ufxzogeixdwvbpdypojb/);
 let blocked=false;
 await handler({request:()=>({url:()=>prodUrl+'/rest/v1/shane_sites'}),abort:async()=>{blocked=true}});
 assert.equal(blocked,true);
});
test('acceptance browser rejects pages without expected configuration',async()=>{
 let handler;
 await guardAcceptancePage({route:async(_,fn)=>{handler=fn}},{url:testUrl,key:'sb_publishable_test'});
 await assert.rejects(()=>handler({request:()=>({url:()=> 'http://localhost:8080/site.html'}),fetch:async()=>({ok:()=>true,text:async()=>'<html></html>'})}),/marker missing/);
});
