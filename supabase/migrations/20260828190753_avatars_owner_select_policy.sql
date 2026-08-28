-- Generated using the create-migration skill
--
-- Migration: replace public avatars SELECT with owner-scoped SELECT
-- Purpose: clear 0025_public_bucket_allows_listing. Public object URLs still
--   work via the public bucket flag; upsert still needs SELECT to check the
--   existing object before overwrite.
-- Affected: storage.objects (avatars SELECT policy only)
-- RLS: drop "Avatars are publicly readable"; create owner-folder SELECT for
--   authenticated (same path rule as INSERT/UPDATE/DELETE)

drop policy if exists "Avatars are publicly readable" on storage.objects;

create policy "Avatars are selectable by owner"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
