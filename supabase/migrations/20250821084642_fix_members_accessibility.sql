-- 0) Pre-req: ensure pgcrypto exists (safe re-run)
create extension if not exists "pgcrypto";

-- 1) Ensure profiles has fields we need
alter table public.profiles
  add column if not exists full_name  text,
  add column if not exists avatar_url text,
  add column if not exists email      text;

-- 2) Backfill email/full_name once from auth.users (safe: only when null)
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '');

update public.profiles p
set full_name = coalesce(p.full_name, p.display_name)
where p.full_name is null;

-- 3) Keep your signup trigger but make sure it fills full_name/email too
-- (replaces the earlier version in your init migration)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),        -- display_name
    coalesce(new.raw_user_meta_data->>'full_name', new.email),        -- full_name
    new.email,                                                        -- email
    null                                                              -- avatar_url (set later)
  )
  on conflict (id) do update
    set display_name = excluded.display_name,
        full_name    = excluded.full_name,
        email        = excluded.email;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 4) Profiles RLS: keep "read self", add "read members of my orgs"
-- (You already have update-policy; we keep it.)
drop policy if exists "profiles: read self" on public.profiles;
create policy "profiles: read self"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "profiles: read users in my orgs" on public.profiles;
create policy "profiles: read users in my orgs"
on public.profiles for select to authenticated
using (
  exists (
    select 1
    from public.organization_members m_me
    join public.organization_members m_tgt
      on m_tgt.org_id = m_me.org_id
     and m_tgt.user_id = public.profiles.id
    where m_me.user_id = auth.uid()
  )
);

-- 5) Convenience view to avoid cross-schema joins in app code
create or replace view public.org_members_view as
select
  om.org_id,
  om.user_id,
  om.role,
  p.full_name   as display_name,
  p.avatar_url,
  p.email
from public.organization_members om
left join public.profiles p on p.id = om.user_id;

-- (TABLE policies apply through the view, nothing special needed here.)

-- 6) (Optional but recommended) index for org member listing
create index if not exists idx_organization_members_org_id on public.organization_members(org_id);
