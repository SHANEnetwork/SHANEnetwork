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
 let id=null,listingId=null;
 try{
  const {data:created,error:insertError}=await sb.from('shane_endeavors')
   .insert({owner_id:user.id,title:token,idea:'Private initial vision '+token,region:'',audience:'',resources:'',plan:''})
   .select('id,title,idea,owner_id').single();
  assert.ifError(insertError);
  assert.equal(created.owner_id,user.id);
  assert.equal(created.idea,'Private initial vision '+token,'Original endeavor intent must be saved exactly');
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
  // Verify that an actual component remains attached to its endeavor, rather than
  // merely existing somewhere in the account. No publishing or invitations.
  const {data:listing,error:listingError}=await sb.from('shane_listings')
   .insert({owner_id:user.id,endeavor_id:id,title:'Private component '+token,
    description:'Private collaboration listing for '+token,category:'project',
    status:'draft',attribution_confirmed:false})
   .select('id,endeavor_id,status,owner_id').single();
  assert.ifError(listingError);
  assert.equal(listing.endeavor_id,id,'Saved component must belong to the endeavor');
  assert.equal(listing.status,'draft','Test must not publish a component');
  listingId=listing.id;
  const {data:publicListing,error:publicListingError}=await anonymous.from('shane_listings')
   .select('id').eq('id',listingId);
  assert.ifError(publicListingError);
  assert.equal(publicListing.length,0,'PRIVATE DATA EXPOSURE: anonymous user sees draft component');
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
  const {data:reopenedListing,error:reopenListingError}=await sb.from('shane_listings')
   .select('id,endeavor_id,status,owner_id').eq('id',listingId).single();
  assert.ifError(reopenListingError);
  assert.equal(reopenedListing.endeavor_id,id,'Component link must survive sign-out and return');
  assert.equal(reopenedListing.owner_id,user.id);
  assert.equal(reopenedListing.status,'draft');
  console.log('PASS dedicated account private component creation, association, privacy and return');

  console.log('PASS dedicated account create, revise, sign-out, return and reopen');
  console.log('Publication NOT tested: requires separately verified site publication flow and explicit test authorization');
 }finally{
  // A failed sign-in/return assertion can leave the client signed out.
  // Restore the dedicated test session before cleanup so test data is not orphaned.
  if(id||listingId){
   const {data:{user:cleanupUser},error:cleanupAuthError}=await sb.auth.getUser();
   if(cleanupAuthError||cleanupUser?.id!==user.id){
    const {data:{user:restored},error:restoreError}=await sb.auth.signInWithPassword({email,password});
    assert.ifError(restoreError);
    assert.equal(restored?.id,user.id,'Cleanup must use the original test account');
   }
  }
  if(listingId){
   const {data:deleted,error}=await sb.from('shane_listings').delete()
    .eq('id',listingId).eq('owner_id',user.id).select('id');
   assert.ifError(error);
   assert.equal(deleted.length,1,'Dedicated test listing cleanup must remove exactly one row');
  }
  if(id){
   const {data:deleted,error}=await sb.from('shane_endeavors').delete()
    .eq('id',id).eq('owner_id',user.id).select('id');
   assert.ifError(error);
   assert.equal(deleted.length,1,'Dedicated test endeavor cleanup must remove exactly one row');
  }
  await sb.auth.signOut();
 }
})().catch(e=>{console.error('Live test failed:',e.message);process.exitCode=1});
