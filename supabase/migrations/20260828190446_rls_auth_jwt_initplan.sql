-- Generated using the create-migration skill
--
-- Migration: wrap auth.jwt() alone in RLS initplan subqueries
-- Purpose: clear 0003_auth_rls_initplan on admin policies; JSON path stays
--   outside the subquery so Postgres prints `select auth.jwt()` for the linter
-- Affected: public.app_settings, public.app_logs (policy expressions only)
-- RLS: same admin gate and policy names; no table or privilege change

drop policy "App settings are readable by admin" on public.app_settings;
create policy "App settings are readable by admin"
on public.app_settings
for select
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy "App settings are insertable by admin" on public.app_settings;
create policy "App settings are insertable by admin"
on public.app_settings
for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy "App settings are updatable by admin" on public.app_settings;
create policy "App settings are updatable by admin"
on public.app_settings
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy "App logs are readable by admin" on public.app_logs;
create policy "App logs are readable by admin"
on public.app_logs
for select
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy "App logs are updatable by admin" on public.app_logs;
create policy "App logs are updatable by admin"
on public.app_logs
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
