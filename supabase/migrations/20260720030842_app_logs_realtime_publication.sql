-- Generated using the create-migration skill
--
-- Purpose: enable INSERT broadcast on app_logs for the admin logs live feed.
-- Affected: publication supabase_realtime, table public.app_logs.
-- Default replica identity is sufficient for INSERT-only subscriptions.

alter publication supabase_realtime add table public.app_logs;
