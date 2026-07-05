import {
  AVATAR_BUCKET,
  buildAvatarStoragePath,
} from '@/constants/storage-paths'

export const extractAvatarCacheBust = (url: string): number | null => {
  try {
    const version = new URL(url).searchParams.get('v')
    if (!version) {
      return null
    }

    const parsed = Number(version)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const withAvatarCacheBust = (
  publicUrl: string,
  version?: number,
): string => `${publicUrl}?v=${version ?? Date.now()}`

const parseSupabaseOrigin = (
  supabaseUrl: string | undefined,
): string | null => {
  if (!supabaseUrl) {
    return null
  }

  try {
    return new URL(supabaseUrl).origin
  } catch {
    return null
  }
}

export const isOwnedAvatarStorageUrl = (
  url: string,
  userId: string,
): boolean => {
  const supabaseOrigin = parseSupabaseOrigin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  )

  if (!supabaseOrigin) {
    return false
  }

  try {
    const parsed = new URL(url)
    const ownedSuffix = `/${AVATAR_BUCKET}/${buildAvatarStoragePath(userId)}`

    return (
      parsed.origin === supabaseOrigin && parsed.pathname.endsWith(ownedSuffix)
    )
  } catch {
    return false
  }
}
