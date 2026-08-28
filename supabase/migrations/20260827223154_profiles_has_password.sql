-- Generated using the create-migration skill
--
-- Migration: add has_password to profiles
-- Purpose: track whether the account has a user-chosen password (not platform-generated hash)
-- Affected: public.profiles, public.handle_new_user()
-- RLS: no new policies; column grants restrict client update to display_name, avatar_url, bio

alter table public.profiles
  add column has_password boolean not null default false;

comment on column public.profiles.has_password is 'App-level flag: account has a user-chosen password; not derived from auth hash.';

update public.profiles
set has_password = true;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, has_password)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'has_password', 'false') = 'true'
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url, bio) on public.profiles to authenticated;
