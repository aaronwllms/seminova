-- Generated using the create-migration skill
--
-- Migration: create public.app_logs
-- Purpose: durable application log rows for admin observability (Epic 3 persistence layer)
-- Affected: public.app_logs
-- RLS: admin-only SELECT for authenticated users; writes via service client only

create table public.app_logs (
  id bigint generated always as identity primary key,
  level text not null,
  tag text not null,
  message text not null,
  context jsonb,
  created_at timestamptz not null default now(),
  constraint app_logs_level_check check (
    level in ('debug', 'info', 'warn', 'error')
  )
);

comment on table public.app_logs is 'Application log rows persisted by appLog/cliLog wrappers; admin-readable via RLS.';

create index app_logs_created_at_id_idx on public.app_logs (created_at desc, id desc);

alter table public.app_logs enable row level security;

create policy "App logs are readable by admin"
on public.app_logs
for select
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
