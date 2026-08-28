-- Generated using the create-migration skill
--
-- Migration: default has_password to false on signup
-- Purpose: always insert has_password = false regardless of client metadata
-- Affected: public.handle_new_user
-- RLS: none

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, has_password)
  values (new.id, false);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;
