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
grant select,insert on public.shane_endeavor_members to authenticated;
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
-- Owners alone may update membership rows. Invitees cannot elevate their roles.
drop policy if exists "Owners manage invitations" on public.shane_endeavor_members;
create policy "Owners manage invitations" on public.shane_endeavor_members for update to authenticated
using (exists (select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid())))
with check (exists (select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid())));
-- Only grant UPDATE on role, never invitation status or ownership identifiers.
revoke update on public.shane_endeavor_members from authenticated;
grant update (role) on public.shane_endeavor_members to authenticated;
-- Role updates are restricted to endeavor owners by the UPDATE RLS policy.
-- Invitation status cannot be directly activated by an owner; acceptance uses the invitee RPC.
-- Revocation requires a separate owner-authorized operation before deployment.
-- SECURITY NOTE: Column grants do not restrict role changes by an owner; review
-- role transitions, invitation consent, and revocation before deployment.
-- An invitee's acceptance/decline needs a separate secure RPC with a strict
-- status transition and immutable role. Do not expose a direct client UPDATE.
