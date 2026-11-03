-- SHANE Fractal Conversation Memory v1. Apply only to SHANEnetwork after review.
-- Append-only turn ledger; 20-turn chapter grouping is derived, never a deletion threshold.
create table if not exists public.shane_memory_turns (
 id uuid primary key default gen_random_uuid(),
 endeavor_id uuid not null references public.shane_endeavors(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 client_turn_id uuid not null,
 turn_number bigint not null check(turn_number>0),
 role text not null check(role in ('you','shane')),
 body text not null check(char_length(body) between 1 and 12000),
 created_at timestamptz not null default now(),
 unique(endeavor_id,client_turn_id),
 unique(endeavor_id,turn_number)
);
create index if not exists shane_memory_turns_chapter_idx on public.shane_memory_turns(endeavor_id,turn_number);
alter table public.shane_memory_turns enable row level security;
drop policy if exists shane_memory_turns_owner_read on public.shane_memory_turns;
create policy shane_memory_turns_owner_read on public.shane_memory_turns for select to authenticated
 using(owner_id=(select auth.uid()) and exists(select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid())));
drop policy if exists shane_memory_turns_owner_write on public.shane_memory_turns;
create policy shane_memory_turns_owner_write on public.shane_memory_turns for insert to authenticated
 with check(owner_id=(select auth.uid()) and exists(select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid())));
-- Updates/deletes deliberately unavailable to clients. Corrections are new turns.
create table if not exists public.shane_memory_chapters (
 endeavor_id uuid not null references public.shane_endeavors(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 chapter_number bigint not null check(chapter_number>0),
 summary text not null default '',
 decisions jsonb not null default '[]'::jsonb check(jsonb_typeof(decisions)='array'),
 references jsonb not null default '[]'::jsonb check(jsonb_typeof(references)='array'),
 updated_at timestamptz not null default now(),
 primary key(endeavor_id,chapter_number)
);
alter table public.shane_memory_chapters enable row level security;
drop policy if exists shane_memory_chapters_owner_read on public.shane_memory_chapters;
create policy shane_memory_chapters_owner_read on public.shane_memory_chapters for select to authenticated
 using(owner_id=(select auth.uid()) and exists(select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid())));
drop policy if exists shane_memory_chapters_owner_insert on public.shane_memory_chapters;
create policy shane_memory_chapters_owner_insert on public.shane_memory_chapters for insert to authenticated
 with check(owner_id=(select auth.uid()) and exists(select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid())));
drop policy if exists shane_memory_chapters_owner_update on public.shane_memory_chapters;
create policy shane_memory_chapters_owner_update on public.shane_memory_chapters for update to authenticated
 using(owner_id=(select auth.uid()) and exists(select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid())))
 with check(owner_id=(select auth.uid()) and exists(select 1 from public.shane_endeavors e where e.id=endeavor_id and e.owner_id=(select auth.uid())));
grant select,insert on public.shane_memory_turns to authenticated;
grant select,insert,update on public.shane_memory_chapters to authenticated;
-- A chapter is turns 1-20, 21-40, etc. Summary is optional and must never replace original turns.
