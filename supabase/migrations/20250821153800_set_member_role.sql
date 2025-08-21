-- Add a safe role-change RPC for organization members (prevents removing last admin)
create or replace function public.set_member_role(
  p_org_id uuid,
  p_user_id uuid,
  p_role public.org_role
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare admin_count int;
declare is_target_admin boolean;
begin
  -- Caller must be admin of org
  if not public.is_org_admin(p_org_id) then
    raise exception 'Not authorized';
  end if;

  -- Count admins before change
  select count(*) into admin_count
  from public.organization_members
  where org_id = p_org_id and role = 'admin';

  -- Is the target currently an admin?
  select exists(
    select 1 from public.organization_members
    where org_id = p_org_id and user_id = p_user_id and role = 'admin'
  ) into is_target_admin;

  -- Prevent removing the last admin
  if p_role = 'member' and is_target_admin and admin_count = 1 then
    raise exception 'Cannot demote the last admin of the organization.';
  end if;

  update public.organization_members
  set role = p_role
  where org_id = p_org_id and user_id = p_user_id;

  if not found then
    raise exception 'Member not found';
  end if;
end $$;

revoke all on function public.set_member_role(uuid, uuid, public.org_role) from public;
grant execute on function public.set_member_role(uuid, uuid, public.org_role) to authenticated;
