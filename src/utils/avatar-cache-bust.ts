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

export const isOwnedAvatarStorageUrl = (
  url: string,
  userId: string,
): boolean => {
  try {
    const ownedSuffix = `/${AVATAR_BUCKET}/${buildAvatarStoragePath(userId)}`
    return new URL(url).pathname.endsWith(ownedSuffix)
  } catch {
    return false
  }
}
