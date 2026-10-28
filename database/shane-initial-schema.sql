-- SHANEnetwork initial schema. Review and apply ONLY to SHANE Supabase project.
-- Never run against SHON. All public tables have RLS.
create extension if not exists pgcrypto;
create table if not exists public.shane_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(display_name) between 1 and 100),
 bio text not null default '',
 region text not null default '',
 visible boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.shane_listings (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 150),
 category text not null check (category in ('person','business','organization','project','service','event','opportunity')),
 description text not null default '',
 region text not null default '',
 website_url text,
 status text not null default 'draft' check (status in ('draft','published','unlisted')),
 attribution_confirmed boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint shane_publish_attribution check (status <> 'published' or attribution_confirmed)
);
create index if not exists shane_listings_public_idx on public.shane_listings (status,category,created_at desc);
create table if not exists public.shane_rooms (
 id uuid primary key default gen_random_uuid(),
 listing_id uuid references public.shane_listings(id) on delete set null,
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 120),
 created_at timestamptz not null default now()
);
create table if not exists public.shane_room_members (
 room_id uuid not null references public.shane_rooms(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'member' check (role in ('owner','moderator','member')),
 joined_at timestamptz not null default now(),
 primary key (room_id,user_id)
);
create table if not exists public.shane_messages (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references public.shane_rooms(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 body text not null check (char_length(body) between 1 and 5000),
 created_at timestamptz not null default now()
);
create index if not exists shane_messages_room_idx on public.shane_messages(room_id,created_at desc);
alter table public.shane_profiles enable row level security;
alter table public.shane_listings enable row level security;
alter table public.shane_rooms enable row level security;
alter table public.shane_room_members enable row level security;
alter table public.shane_messages enable row level security;
create policy "profiles public opt in" on public.shane_profiles for select to anon,authenticated using (visible or user_id = (select auth.uid()));
create policy "profiles owner insert" on public.shane_profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy "profiles owner update" on public.shane_profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "profiles owner delete" on public.shane_profiles for delete to authenticated using (user_id = (select auth.uid()));
create policy "listings public or owner" on public.shane_listings for select to anon,authenticated using (status = 'published' or owner_id = (select auth.uid()));
create policy "listings owner insert" on public.shane_listings for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "listings owner update" on public.shane_listings for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "listings owner delete" on public.shane_listings for delete to authenticated using (owner_id = (select auth.uid()));
-- Room ownership grants access even before a room membership row is created.
create policy "rooms member or owner read" on public.shane_rooms for select to authenticated using (owner_id = (select auth.uid()) or exists (select 1 from public.shane_room_members m where m.room_id = id and m.user_id = (select auth.uid())));
create policy "rooms owner insert" on public.shane_rooms for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "rooms owner update" on public.shane_rooms for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "rooms owner delete" on public.shane_rooms for delete to authenticated using (owner_id = (select auth.uid()));
-- Membership reads are scoped through room ownership to avoid recursive member policies.
create policy "members owner or self read" on public.shane_room_members for select to authenticated using (user_id = (select auth.uid()) or exists (select 1 from public.shane_rooms r where r.id = room_id and r.owner_id = (select auth.uid())));
create policy "members room owner add" on public.shane_room_members for insert to authenticated with check (exists (select 1 from public.shane_rooms r where r.id = room_id and r.owner_id = (select auth.uid())));
create policy "members room owner remove" on public.shane_room_members for delete to authenticated using (exists (select 1 from public.shane_rooms r where r.id = room_id and r.owner_id = (select auth.uid())) or user_id = (select auth.uid()));
create policy "messages room access read" on public.shane_messages for select to authenticated using (exists (select 1 from public.shane_rooms r where r.id = room_id and (r.owner_id = (select auth.uid()) or exists (select 1 from public.shane_room_members m where m.room_id = r.id and m.user_id = (select auth.uid())))));
create policy "messages sender in room" on public.shane_messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists (select 1 from public.shane_rooms r where r.id = room_id and (r.owner_id = (select auth.uid()) or exists (select 1 from public.shane_room_members m where m.room_id = r.id and m.user_id = (select auth.uid())))));
-- Publishing requires attribution confirmation; automated external verification is future work.
-- Before production: security test with separate user sessions, add abuse controls, and review policies.
