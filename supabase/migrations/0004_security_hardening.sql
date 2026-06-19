-- Security hardening for profiles, projects, and factory master data.
-- Backward compatible with the current frontend: self profile updates remain
-- available, but a trigger limits non-admin users to signature changes only.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  if auth.uid() is null or auth.uid() <> old.id then
    raise exception 'profile update is not permitted';
  end if;

  if new.id is distinct from old.id
     or new.username is distinct from old.username
     or new.unit is distinct from old.unit
     or new.role is distinct from old.role
     or new.level is distinct from old.level then
    raise exception 'only your signature can be updated';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_profile_privileged_fields() from public;

drop trigger if exists profiles_protect_privileged_fields on public.profiles;
create trigger profiles_protect_privileged_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, unit, role, level)
  values (
    new.id,
    coalesce(nullif(split_part(new.email, '@', 1), ''), 'user'),
    '',
    'rd',
    ''
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop policy if exists profiles_upsert_self on public.profiles;
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update_self on public.profiles;
drop policy if exists profiles_update_admin on public.profiles;

create policy profiles_select on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists projects_all on public.projects;
drop policy if exists projects_select_scoped on public.projects;
drop policy if exists projects_insert_scoped on public.projects;
drop policy if exists projects_update_scoped on public.projects;
drop policy if exists projects_delete_scoped on public.projects;

create policy projects_select_scoped on public.projects
  for select to authenticated
  using (workspace = 'default' or (workspace = 'admin_test' and public.is_admin()));

create policy projects_insert_scoped on public.projects
  for insert to authenticated
  with check (
    (workspace = 'default' or (workspace = 'admin_test' and public.is_admin()))
    and updated_by = auth.uid()
  );

create policy projects_update_scoped on public.projects
  for update to authenticated
  using (workspace = 'default' or (workspace = 'admin_test' and public.is_admin()))
  with check (
    (workspace = 'default' or (workspace = 'admin_test' and public.is_admin()))
    and updated_by = auth.uid()
  );

create policy projects_delete_scoped on public.projects
  for delete to authenticated
  using (workspace = 'default' or (workspace = 'admin_test' and public.is_admin()));

drop policy if exists factories_all on public.factories;
drop policy if exists factories_select_authenticated on public.factories;
drop policy if exists factories_insert_admin on public.factories;
drop policy if exists factories_update_admin on public.factories;
drop policy if exists factories_delete_admin on public.factories;

create policy factories_select_authenticated on public.factories
  for select to authenticated using (true);

create policy factories_insert_admin on public.factories
  for insert to authenticated with check (public.is_admin());

create policy factories_update_admin on public.factories
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy factories_delete_admin on public.factories
  for delete to authenticated using (public.is_admin());
