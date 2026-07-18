-- Generated using the create-migration skill
--
-- Migration: schedule app_logs retention purge
-- Purpose: enable pg_cron and delete app_logs rows older than log_retention_days on a daily schedule
-- Affected: extensions.pg_cron, public.purge_expired_app_logs (function), cron.job
-- RLS: purge function is security definer and bypasses RLS for DELETE; no new table policies

create extension if not exists pg_cron with schema extensions;

create or replace function public.purge_expired_app_logs()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- debt: keep in sync with log_retention_days default in src/config/app-settings-registry.ts
  v_default_retention_days constant int := 30;
  v_retention_days int;
begin
  select (value #>> '{}')::int
  into v_retention_days
  from public.app_settings
  where key = 'log_retention_days'
    and jsonb_typeof(value) = 'number'
    and (value #>> '{}')::int > 0;

  v_retention_days := coalesce(v_retention_days, v_default_retention_days);

  delete from public.app_logs
  where created_at < now() - make_interval(days => v_retention_days);
end;
$$;

comment on function public.purge_expired_app_logs() is
  'Deletes app_logs rows older than log_retention_days (registry default when unset). Invoked by pg_cron.';

revoke all on function public.purge_expired_app_logs() from public;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'purge-expired-app-logs') then
    perform cron.unschedule('purge-expired-app-logs');
  end if;
end $$;

select cron.schedule(
  'purge-expired-app-logs',
  '0 3 * * *',
  $$select public.purge_expired_app_logs();$$
);
