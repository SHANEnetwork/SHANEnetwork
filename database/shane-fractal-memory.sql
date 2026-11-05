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
 source_references jsonb not null default '[]'::jsonb check(jsonb_typeof(source_references)='array'),
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

-- Atomic, idempotent turn allocation. SECURITY INVOKER retains table RLS.
-- Serializes writers per endeavor by locking the endeavor row within the transaction.
create or replace function public.shane_append_memory_turn(
 p_endeavor_id uuid, p_client_turn_id uuid, p_role text, p_body text
) returns bigint language plpgsql security invoker set search_path = '' as $$
declare v_owner uuid; v_number bigint;
begin
 v_owner := (select auth.uid());
 if v_owner is null then raise exception 'Authentication required'; end if;
 if p_role not in ('you','shane') or p_body is null or char_length(btrim(p_body)) not between 1 and 12000 then
   raise exception 'Invalid conversation turn';
 end if;
 perform 1 from public.shane_endeavors e
   where e.id=p_endeavor_id and e.owner_id=v_owner for update;
 if not found then raise exception 'Endeavor unavailable'; end if;
 select t.turn_number into v_number from public.shane_memory_turns t
   where t.endeavor_id=p_endeavor_id and t.client_turn_id=p_client_turn_id;
 if found then return v_number; end if;
 select coalesce(max(t.turn_number),0)+1 into v_number
   from public.shane_memory_turns t where t.endeavor_id=p_endeavor_id;
 insert into public.shane_memory_turns(endeavor_id,owner_id,client_turn_id,turn_number,role,body)
 values(p_endeavor_id,v_owner,p_client_turn_id,v_number,p_role,btrim(p_body));
 return v_number;
end; $$;
revoke all on function public.shane_append_memory_turn(uuid,uuid,text,text) from public,anon;
grant execute on function public.shane_append_memory_turn(uuid,uuid,text,text) to authenticated;
