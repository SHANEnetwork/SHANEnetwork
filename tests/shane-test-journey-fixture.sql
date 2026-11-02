-- SHANE Test only: acceptance-journey fixture integrity.
-- Read-only. Run against the isolated SHANE Test project, never SHONnetwork.
-- These checks establish linked persisted records; they do NOT substitute for
-- two-account authenticated browser tests, RLS checks, or revision round trips.
do $shane$
declare
  endeavor uuid := '44444444-4444-4444-8444-444444444444';
  listing uuid := '77777777-7777-4777-8777-777777777777';
  collaboration uuid := '88888888-8888-4888-8888-888888888888';
  linked_site uuid;
  owner uuid;
  other_member uuid;
begin
  select e.linked_site_id,e.owner_id into linked_site,owner
  from public.shane_endeavors e where e.id=endeavor;
  if owner is null or linked_site is null then
    raise exception 'Journey fixture lacks a saved endeavor or linked website';
  end if;
  if not exists (
    select 1 from public.shane_sites s
    where s.id=linked_site and s.owner_id=owner and s.status='draft'
  ) then raise exception 'Linked website missing, not owned, or no longer a draft'; end if;
  if not exists (
    select 1 from public.shane_listings l
    where l.id=listing and l.endeavor_id=endeavor and l.owner_id=owner
  ) then raise exception 'Network listing is not connected to this endeavor and owner'; end if;
  select case when c.sender_id=owner then c.recipient_id else c.sender_id end
  into other_member from public.shane_collaboration_requests c
  where c.id=collaboration and c.listing_id=listing and c.status='accepted'
    and owner in (c.sender_id,c.recipient_id);
  if other_member is null or other_member=owner then
    raise exception 'No distinct accepted collaborator connected to the listing';
  end if;
  if not exists(select 1 from auth.users where id=owner)
     or not exists(select 1 from auth.users where id=other_member) then
    raise exception 'Both participants must have real test auth accounts';
  end if;
  raise notice 'SHANE Test linked fixture verified: endeavor, owned draft site, listing, and accepted two-account collaboration';
end $shane$;

-- Account-scoped visibility: execute each transaction as the real authenticated
-- PostgreSQL role, not as postgres/service_role. All checks are read-only.
-- Owner sees the complete private endeavor and its website.
begin read only;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $owner$
begin
 if (select count(*) from public.shane_endeavors where id='44444444-4444-4444-8444-444444444444')<>1
 or (select count(*) from public.shane_sites where id='55555555-5555-4555-8555-555555555555')<>1
 or (select count(*) from public.shane_collaboration_requests where id='88888888-8888-4888-8888-888888888888')<>1
 then raise exception 'Owner cannot recover the saved journey'; end if;
end $owner$;
rollback;

-- Accepted collaborator can coordinate through the Network but has not
-- implicitly been invited into the private endeavor or draft website.
begin read only;
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $collaborator$
begin
 if (select count(*) from public.shane_endeavors where id='44444444-4444-4444-8444-444444444444')<>0
 or (select count(*) from public.shane_sites where id='55555555-5555-4555-8555-555555555555')<>0
 or (select count(*) from public.shane_collaboration_requests where id='88888888-8888-4888-8888-888888888888')<>1
 or (select count(*) from public.shane_listings where id='77777777-7777-4777-8777-777777777777')<>1
 then raise exception 'Accepted collaborator visibility is incorrect'; end if;
end $collaborator$;
rollback;

-- Unrelated member can discover the Network listing, but cannot access
-- the private endeavor, website, or accepted collaboration.
begin read only;
set local role authenticated;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $outsider$
begin
 if (select count(*) from public.shane_endeavors where id='44444444-4444-4444-8444-444444444444')<>0
 or (select count(*) from public.shane_sites where id='55555555-5555-4555-8555-555555555555')<>0
 or (select count(*) from public.shane_collaboration_requests where id='88888888-8888-4888-8888-888888888888')<>0
 or (select count(*) from public.shane_listings where id='77777777-7777-4777-8777-777777777777')<>1
 then raise exception 'Unrelated member visibility is incorrect'; end if;
end $outsider$;
rollback;
