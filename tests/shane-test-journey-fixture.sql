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
