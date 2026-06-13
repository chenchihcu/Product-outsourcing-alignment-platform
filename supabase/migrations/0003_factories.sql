-- =========================================================================
-- Shared outsourced factory master data
-- =========================================================================

create extension if not exists "pgcrypto";

create table if not exists public.factories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  updated_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists factories_name_idx on public.factories(name);
create index if not exists factories_updated_at_idx on public.factories(updated_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists factories_touch on public.factories;
create trigger factories_touch before update on public.factories
  for each row execute function public.touch_updated_at();

alter table public.factories enable row level security;

-- Shared master data: all authenticated users read and maintain the same list.
drop policy if exists factories_all on public.factories;
create policy factories_all on public.factories
  for all to authenticated using (true) with check (true);

-- Include deleted row names in Realtime payloads so clients can remove them.
alter table public.factories replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'factories'
  ) then
    alter publication supabase_realtime add table public.factories;
  end if;
end $$;
