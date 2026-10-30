-- SHANEnetwork: collaboration request and workspace security hardening.
-- Applied to the live SHANEnetwork database on 2026-10-30.
-- Idempotent when reapplied. Do not apply to SHONnetwork.

create or replace function public.shane_guard_collaboration_response()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if old.status <> 'pending' or new.status not in ('accepted','declined') then
    raise exception 'Only pending collaboration requests may be accepted or declined';
  end if;
  if new.id is distinct from old.id
    or new.listing_id is distinct from old.listing_id
    or new.sender_id is distinct from old.sender_id
    or new.recipient_id is distinct from old.recipient_id
    or new.message is distinct from old.message
    or new.created_at is distinct from old.created_at then
    raise exception 'Collaboration request identity and content cannot be changed on response';
  end if;
  return new;
end;
$$;

drop trigger if exists shane_guard_collaboration_response_trigger
on public.shane_collaboration_requests;
create trigger shane_guard_collaboration_response_trigger
before update on public.shane_collaboration_requests
for each row execute function public.shane_guard_collaboration_response();

revoke update on public.shane_collaboration_tasks from authenticated;
grant update (assignee_id, title, details, due_date, completed)
on public.shane_collaboration_tasks to authenticated;

revoke update on public.shane_collaboration_overviews from authenticated;
grant update (purpose, next_step, updated_by, updated_at)
on public.shane_collaboration_overviews to authenticated;

drop policy if exists "creator_delete_tasks" on public.shane_collaboration_tasks;
create policy "creator_delete_tasks"
on public.shane_collaboration_tasks for delete to authenticated
using (
  creator_id = (select auth.uid())
  and exists (
    select 1 from public.shane_collaboration_requests r
    where r.id = request_id and r.status = 'accepted'
      and ((select auth.uid()) = r.sender_id
        or (select auth.uid()) = r.recipient_id)
  )
);
