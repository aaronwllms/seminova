-- Generated using the create-migration skill
--
-- Migration: app_logs read state and context search column
-- Purpose: global read/unread triage and generated context_text for substring search (Epic 9)
-- Affected: public.app_logs
-- RLS: admin-only UPDATE added alongside existing admin SELECT

alter table public.app_logs
  add column read_at timestamptz null,
  add column context_text text generated always as (coalesce(context::text, '')) stored;

comment on column public.app_logs.read_at is
  'When set, the log row is globally read; null means unread.';

comment on column public.app_logs.context_text is
  'Stored generated search surface for context jsonb; not returned to admin UI row shape.';

create index app_logs_unread_idx on public.app_logs (created_at desc, id desc)
  where read_at is null;

create policy "App logs are updatable by admin"
on public.app_logs
for update
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
