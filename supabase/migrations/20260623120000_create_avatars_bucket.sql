-- Generated using 'Create Database Migration' skill
--
-- Migration: create public avatars storage bucket with owner-scoped write RLS
-- Purpose: first template storage bucket; canonical path {user_id}/avatar.webp (see src/constants/storage-paths.ts)
-- Affected: storage.buckets, storage.objects (RLS policies)
-- Bucket: public-read; authenticated users may write/replace/delete only in their own folder (first path segment = auth.uid())

-- -----------------------------------------------------------------------------
-- Bucket: avatars (public-read; input MIME allowlist mirrors client validation)
-- Constants mirrored in src/constants/storage-paths.ts (AVATAR_MAX_BYTES = 2097152)
-- -----------------------------------------------------------------------------

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- RLS on storage.objects — owner folder scoping via (storage.foldername(name))[1]
-- Path convention: {user_id}/avatar.webp — first segment must match auth.uid()
-- -----------------------------------------------------------------------------

-- INSERT: authenticated users may upload only into their own folder
create policy "Avatars are insertable by owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

-- UPDATE: required for upsert overwrite on re-upload to the same path
create policy "Avatars are updatable by owner"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

-- DELETE: owner may remove their avatar object
create policy "Avatars are deletable by owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
