-- Generated using 'Create Database Migration' skill
--
-- Migration: add SELECT policy on avatars storage objects
-- Purpose: Supabase upsert requires SELECT + UPDATE + INSERT on storage.objects
-- Affected: storage.objects (RLS policy)
-- See: https://supabase.com/docs/guides/storage/security/access-control

-- SELECT: public-read bucket; required for upsert existence check before overwrite
create policy "Avatars are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'avatars');
