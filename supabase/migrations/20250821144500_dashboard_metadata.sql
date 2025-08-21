-- Organizations: basic metadata
alter table public.organizations
  add column if not exists description text,
  add column if not exists logo_url text;

-- Profiles: expanded fields
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists avatar_url text;

-- RLS for profiles: allow users to update *their own* profile
drop policy if exists "profiles: update self" on public.profiles;
create policy "profiles: update self"
on public.profiles
for update
using ( id = auth.uid() )
with check ( id = auth.uid() );
