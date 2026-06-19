-- Emergency rollback for 0004_security_hardening.sql.
-- WARNING: this restores the previous permissive policies and reopens the
-- privilege-escalation and workspace-isolation risks fixed by migration 0004.

drop policy if exists projects_select_scoped on public.projects;
drop policy if exists projects_insert_scoped on public.projects;
drop policy if exists projects_update_scoped on public.projects;
drop policy if exists projects_delete_scoped on public.projects;
create policy projects_all on public.projects
  for all to authenticated using (true) with check (true);

drop policy if exists factories_select_authenticated on public.factories;
drop policy if exists factories_insert_admin on public.factories;
drop policy if exists factories_update_admin on public.factories;
drop policy if exists factories_delete_admin on public.factories;
create policy factories_all on public.factories
  for all to authenticated using (true) with check (true);

drop policy if exists profiles_update_self on public.profiles;
drop policy if exists profiles_update_admin on public.profiles;
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);
create policy profiles_upsert_self on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy profiles_update_self on public.profiles
  for update to authenticated using (auth.uid() = id);
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop trigger if exists profiles_protect_privileged_fields on public.profiles;
drop function if exists public.protect_profile_privileged_fields();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, unit, role, level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'unit',
    coalesce(new.raw_user_meta_data->>'role', 'rd'),
    new.raw_user_meta_data->>'level'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop function if exists public.is_admin();
