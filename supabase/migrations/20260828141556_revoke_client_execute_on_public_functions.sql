-- Generated using the create-migration skill
--
-- Migration: revoke client execute on public functions
-- Purpose: lock down leftover client EXECUTE grants on three existing functions
-- Affected: public.purge_expired_app_logs(), public.admin_list_users(text, text, int, int, text, boolean, boolean, boolean), public.admin_user_stats()
-- RLS: none

revoke execute on function public.purge_expired_app_logs() from public;
revoke execute on function public.purge_expired_app_logs() from anon;
revoke execute on function public.purge_expired_app_logs() from authenticated;

revoke execute on function public.admin_list_users(text, text, int, int, text, boolean, boolean, boolean) from anon;

revoke execute on function public.admin_user_stats() from anon;
