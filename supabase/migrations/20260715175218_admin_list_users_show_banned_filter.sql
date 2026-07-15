-- Generated using the create-migration skill
--
-- Migration: admin_list_users show-banned filter
-- Purpose: add p_show_banned filter and unify is_currently_banned predicate in admin_list_users
-- Affected: public.admin_list_users (function)
-- Security: admin gate via auth.jwt() app_metadata.role (raises on denial);
--   static ORDER BY allowlist (email, email_confirmed_at, created_at, last_sign_in_at, role, banned_until);
--   auth.users stores app metadata in raw_app_meta_data (JWT/API expose it as app_metadata);
--   auth.users.email is varchar(255) — cast to text to match RETURNS TABLE;
--   all auth.users column refs use u. alias — RETURNS TABLE output params share a namespace
--   with query column refs, so unqualified names raise "column reference is ambiguous";
--   REVOKE EXECUTE FROM PUBLIC; GRANT EXECUTE TO authenticated only
-- RLS: N/A — function reads auth.users under SECURITY DEFINER with in-function admin gate

drop function if exists public.admin_list_users(text, text, int, int, text);

create or replace function public.admin_list_users(
  p_sort_column text,
  p_sort_direction text,
  p_page int,
  p_per_page int,
  p_search text,
  p_show_banned boolean
)
returns table (
  id uuid,
  email text,
  email_confirmed_at timestamptz,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  app_metadata jsonb,
  banned_until timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_page int;
  v_per_page int;
  v_search text;
  v_escaped_search text;
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Forbidden: admin role required';
  end if;

  v_page := greatest(coalesce(p_page, 1), 1);
  v_per_page := case
    when p_per_page in (10, 15, 25, 50) then p_per_page
    else 15
  end;

  v_search := nullif(trim(coalesce(p_search, '')), '');

  if v_search is not null and length(v_search) >= 3 then
    v_escaped_search := replace(
      replace(replace(v_search, '\', '\\'), '%', '\%'),
      '_',
      '\_'
    );
  end if;

  return query
  select
    u.id,
    u.email::text,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at,
    u.raw_app_meta_data,
    u.banned_until
  from (
    select
      u_inner.*,
      (u_inner.banned_until is not null and u_inner.banned_until > now()) as is_currently_banned
    from auth.users u_inner
  ) u
  where
    (
      v_escaped_search is null
      or u.email ilike '%' || v_escaped_search || '%' escape '\'
    )
    and (coalesce(p_show_banned, true) or not u.is_currently_banned)
  order by
    case
      when p_sort_column = 'email' and p_sort_direction = 'asc' then u.email
    end asc nulls last,
    case
      when p_sort_column = 'email' and p_sort_direction = 'desc' then u.email
    end desc nulls last,
    case
      when p_sort_column = 'email_confirmed_at' and p_sort_direction = 'asc'
      then u.email_confirmed_at
    end asc nulls last,
    case
      when p_sort_column = 'email_confirmed_at' and p_sort_direction = 'desc'
      then u.email_confirmed_at
    end desc nulls last,
    case
      when p_sort_column = 'created_at' and p_sort_direction = 'asc' then u.created_at
    end asc nulls last,
    case
      when p_sort_column = 'created_at' and p_sort_direction = 'desc' then u.created_at
    end desc nulls last,
    case
      when p_sort_column = 'last_sign_in_at' and p_sort_direction = 'asc'
      then u.last_sign_in_at
    end asc nulls last,
    case
      when p_sort_column = 'last_sign_in_at' and p_sort_direction = 'desc'
      then u.last_sign_in_at
    end desc nulls last,
    case
      when p_sort_column = 'role' and p_sort_direction = 'asc'
      then u.raw_app_meta_data ->> 'role'
    end asc nulls last,
    case
      when p_sort_column = 'role' and p_sort_direction = 'desc'
      then u.raw_app_meta_data ->> 'role'
    end desc nulls last,
    case
      when p_sort_column = 'banned_until' and p_sort_direction = 'asc'
      then case when u.is_currently_banned then u.banned_until else null end
    end asc nulls last,
    case
      when p_sort_column = 'banned_until' and p_sort_direction = 'desc'
      then case when u.is_currently_banned then u.banned_until else null end
    end desc nulls last,
    u.created_at desc
  limit v_per_page
  offset (v_page - 1) * v_per_page;
end;
$$;

comment on function public.admin_list_users(text, text, int, int, text, boolean) is
  'Admin-only paginated auth.users listing with allowlisted sort, optional email search, and show-banned filter.';

revoke execute on function public.admin_list_users(text, text, int, int, text, boolean) from public;
grant execute on function public.admin_list_users(text, text, int, int, text, boolean) to authenticated;
