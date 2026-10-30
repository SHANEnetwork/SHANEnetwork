-- Invitation response is limited to the signed-in invitee's pending row.
create or replace function public.shane_respond_to_endeavor_invite(p_endeavor_id uuid,p_accept boolean)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare changed integer;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
 update public.shane_endeavor_members
 set status=case when p_accept then 'active' else 'declined' end, updated_at=now()
 where endeavor_id=p_endeavor_id and user_id=(select auth.uid()) and status='invited';
 get diagnostics changed=row_count;
 return changed=1;
end;
$$;
revoke all on function public.shane_respond_to_endeavor_invite(uuid,boolean) from public,anon;
grant execute on function public.shane_respond_to_endeavor_invite(uuid,boolean) to authenticated;
