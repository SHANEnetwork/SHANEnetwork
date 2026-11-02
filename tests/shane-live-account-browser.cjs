const assert=require('node:assert/strict');
const {createClient}=require('@supabase/supabase-js');
const email=process.env.SHANE_E2E_EMAIL;
const password=process.env.SHANE_E2E_PASSWORD;
const url='https://ufxzogeixdwvbpdypojb.supabase.co';
const key='sb_publishable_iR9kxdCfQ7850VleEUx7mA_nHS4WZpB';
const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
(async()=>{
 assert(email&&password,'Dedicated test account credentials are required');
 const {data:{user},error:authError}=await sb.auth.signInWithPassword({email,password});
 assert.ifError(authError);
 assert(user?.id,'Dedicated test account did not authenticate');
 const token='SHANE-E2E-'+Date.now();
 let id=null;
 try{
  const {data:created,error:insertError}=await sb.from('shane_endeavors')
   .insert({owner_id:user.id,title:token,idea:'Private initial vision '+token,region:'',audience:'',resources:'',plan:''})
   .select('id,title,idea,owner_id').single();
  assert.ifError(insertError);
  assert.equal(created.owner_id,user.id);
  id=created.id;
  const anonymous=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:exposed,error:anonymousError}=await anonymous.from('shane_endeavors')
   .select('id,idea').eq('id',id);
  assert.ifError(anonymousError);
  assert.equal(exposed.length,0,'PRIVATE DATA EXPOSURE: anonymous visitors can read a private endeavor');
  const {data:updated,error:updateError}=await sb.from('shane_endeavors')
   .update({idea:'Revised vision '+token}).eq('id',id).eq('owner_id',user.id)
   .select('id,idea').single();
  assert.ifError(updateError);
  assert.equal(updated.idea,'Revised vision '+token);
  const {error:signoutError}=await sb.auth.signOut();
  assert.ifError(signoutError);
  const {data:{user:returned},error:returnError}=await sb.auth.signInWithPassword({email,password});
  assert.ifError(returnError);
  assert.equal(returned.id,user.id);
  const {data:reopened,error:reopenError}=await sb.from('shane_endeavors')
   .select('id,idea,owner_id').eq('id',id).single();
  assert.ifError(reopenError);
  assert.equal(reopened.idea,'Revised vision '+token);
  assert.equal(reopened.owner_id,user.id);
  console.log('PASS dedicated account create, revise, sign-out, return and reopen');
  console.log('Publication NOT tested: requires separately verified site publication flow and explicit test authorization');
 }finally{
  if(id){
   const {error}=await sb.from('shane_endeavors').delete().eq('id',id).eq('owner_id',user.id);
   if(error)console.error('Dedicated test record cleanup failed:',error.message);
  }
  await sb.auth.signOut();
 }
})().catch(e=>{console.error('Live test failed:',e.message);process.exitCode=1});
