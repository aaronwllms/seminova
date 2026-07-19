-- Generated using the create-migration skill
--
-- Migration: create public.app_settings
-- Purpose: admin-editable runtime configuration values keyed by the code registry
-- Affected: public.app_settings
-- RLS: admin-only SELECT, INSERT, UPDATE for authenticated users

create table public.app_settings (
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (key)
);

comment on table public.app_settings is 'Admin-editable runtime configuration values; keys must exist in the code registry.';

alter table public.app_settings enable row level security;

create policy "App settings are readable by admin"
on public.app_settings
for select
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "App settings are insertable by admin"
on public.app_settings
for insert
to authenticated
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "App settings are updatable by admin"
on public.app_settings
for update
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
