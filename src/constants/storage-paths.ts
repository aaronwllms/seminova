export const AVATAR_BUCKET = 'avatars'

/** Input file size cap before client-side resize (mirrors migration file_size_limit). */
export const AVATAR_MAX_BYTES = 2_097_152

/** Input MIME allowlist (mirrors migration allowed_mime_types). */
export const AVATAR_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const AVATAR_CANONICAL_FILENAME = 'avatar.webp'

export const AVATAR_MAX_DIMENSION = 256

export const AVATAR_WEBP_QUALITY = 0.85

export const buildAvatarStoragePath = (userId: string): string =>
  `${userId}/${AVATAR_CANONICAL_FILENAME}`
