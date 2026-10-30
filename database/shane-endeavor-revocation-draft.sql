-- SHANE endeavor membership revocation. Apply only after the membership draft is reviewed and installed.
-- The owner is resolved from the database, never from caller-provided claims.
create or replace function public.shane_revoke_endeavor_member(
 p_endeavor_id uuid, p_user_id uuid
) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare changed integer;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
 if p_endeavor_id is null or p_user_id is null then raise exception 'Member identifiers required'; end if;
 if not exists (
   select 1 from public.shane_endeavors e
   where e.id = p_endeavor_id and e.owner_id = (select auth.uid())
 ) then return false; end if;
 if p_user_id = (select auth.uid()) then return false; end if;
 update public.shane_endeavor_members
 set status = 'revoked', updated_at = now()
 where endeavor_id = p_endeavor_id and user_id = p_user_id
   and status in ('invited','active');
 get diagnostics changed = row_count;
 return changed = 1;
end;
$$;
revoke all on function public.shane_revoke_endeavor_member(uuid,uuid) from public, anon;
grant execute on function public.shane_revoke_endeavor_member(uuid,uuid) to authenticated;
