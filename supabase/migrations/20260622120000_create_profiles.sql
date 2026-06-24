-- Generated using 'Create Database Migration' skill
--
-- Migration: create public.profiles (1:1 with auth.users)
-- Purpose: app-level user data home; auto-created on signup via trigger
-- Affected: public.profiles, auth.users (trigger)
-- RLS: owner-scoped SELECT and UPDATE for authenticated users only

-- -----------------------------------------------------------------------------
-- Table: public.profiles
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid not null references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  primary key (id)
);

comment on table public.profiles is 'App-level user profile data; 1:1 with auth.users. No role column — admin gate stays on app_metadata.role.';

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;

-- SELECT: authenticated users may read only their own profile row
create policy "Profiles are readable by owner"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

-- UPDATE: authenticated users may update only their own profile row
-- USING gates which existing rows are visible for update; WITH CHECK blocks id reassignment
create policy "Profiles are updatable by owner"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- INSERT: belt-and-suspenders for direct client inserts (primary path is signup trigger)
create policy "Profiles are insertable by owner"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

-- -----------------------------------------------------------------------------
-- Trigger: auto-create profile on signup
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

comment on function public.handle_new_user() is 'Inserts a profiles row when a new auth.users row is created.';

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Backfill: existing auth.users without a profile row (e.g. dev accounts pre-migration)
-- -----------------------------------------------------------------------------

insert into public.profiles (id)
select auth.users.id
from auth.users
on conflict (id) do nothing;
