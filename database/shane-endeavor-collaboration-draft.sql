-- SHANE collaborative endeavor foundation. Apply to SHANE project only.
-- Invitations grant access; they do not transfer ownership of endeavors.
create table if not exists public.shane_endeavor_members (
 endeavor_id uuid not null references public.shane_endeavors(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('viewer','contributor','editor','manager')),
 status text not null default 'invited' check (status in ('invited','active','declined','revoked')),
 invited_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 primary key (endeavor_id,user_id)
);
alter table public.shane_endeavor_members enable row level security;
revoke all on public.shane_endeavor_members from anon;
grant select,insert,update on public.shane_endeavor_members to authenticated;
drop policy if exists "Members see own invitation or owner sees members" on public.shane_endeavor_members;
create policy "Members see own invitation or owner sees members" on public.shane_endeavor_members for select to authenticated
using (user_id=(select auth.uid()) or exists (
 select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid())
));
drop policy if exists "Owners invite collaborators" on public.shane_endeavor_members;
create policy "Owners invite collaborators" on public.shane_endeavor_members for insert to authenticated
with check (invited_by=(select auth.uid()) and status='invited' and user_id<>invited_by and exists (
 select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid())
));
drop policy if exists "Owners manage invitations or invitees respond" on public.shane_endeavor_members;
create policy "Owners manage invitations or invitees respond" on public.shane_endeavor_members for update to authenticated
using (exists (select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid()))
 or user_id=(select auth.uid()))
with check (exists (select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid()))
 or (user_id=(select auth.uid()) and status in ('active','declined')));
-- IMPORTANT: PostgreSQL RLS alone cannot stop invitees changing their role on UPDATE.
-- Until column-level grants and a secured accept/decline RPC are implemented, do not enable direct invitee UPDATE.
revoke update on public.shane_endeavor_members from authenticated;
