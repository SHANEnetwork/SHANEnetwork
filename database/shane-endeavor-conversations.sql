-- SHANE account-backed conversation memory. Apply to SHANEnetwork only.
create table if not exists public.shane_endeavor_conversations (
 endeavor_id uuid primary key references public.shane_endeavors(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 history jsonb not null default '[]'::jsonb,
 draft_ready boolean not null default false,
 updated_at timestamptz not null default now(),
 constraint shane_endeavor_conversations_history_array check (jsonb_typeof(history) = 'array'),
 constraint shane_endeavor_conversations_history_limit check (jsonb_array_length(history) <= 20)
);
alter table public.shane_endeavor_conversations enable row level security;
revoke all on public.shane_endeavor_conversations from anon;
grant select, insert, update, delete on public.shane_endeavor_conversations to authenticated;
drop policy if exists shane_conversation_owner_select on public.shane_endeavor_conversations;
create policy shane_conversation_owner_select on public.shane_endeavor_conversations for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists shane_conversation_owner_insert on public.shane_endeavor_conversations;
create policy shane_conversation_owner_insert on public.shane_endeavor_conversations for insert to authenticated with check (owner_id = (select auth.uid()) and exists (select 1 from public.shane_endeavors e where e.id = endeavor_id and e.owner_id = (select auth.uid())));
drop policy if exists shane_conversation_owner_update on public.shane_endeavor_conversations;
create policy shane_conversation_owner_update on public.shane_endeavor_conversations for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()) and exists (select 1 from public.shane_endeavors e where e.id = endeavor_id and e.owner_id = (select auth.uid())));
drop policy if exists shane_conversation_owner_delete on public.shane_endeavor_conversations;
create policy shane_conversation_owner_delete on public.shane_endeavor_conversations for delete to authenticated using (owner_id = (select auth.uid()));
