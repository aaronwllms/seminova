import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildAvatarStoragePath } from '@/constants/storage-paths'

import {
  extractAvatarCacheBust,
  isOwnedAvatarStorageUrl,
  withAvatarCacheBust,
} from './avatar-cache-bust'

const USER_ID = 'user-1'
const OTHER_USER_ID = 'other-user'
const SUPABASE_URL = 'https://example.supabase.co'
const OWNED_PATH = `${SUPABASE_URL}/storage/v1/object/public/avatars/${USER_ID}/avatar.webp`

describe('withAvatarCacheBust', () => {
  it('should append an explicit version query param', () => {
    expect(withAvatarCacheBust('https://example.test/avatar.webp', 123)).toBe(
      'https://example.test/avatar.webp?v=123',
    )
  })

  it('should use Date.now when no version is provided', () => {
    vi.spyOn(Date, 'now').mockReturnValue(999)

    expect(withAvatarCacheBust('https://example.test/avatar.webp')).toBe(
      'https://example.test/avatar.webp?v=999',
    )
  })
})

describe('extractAvatarCacheBust', () => {
  it('should return the version from a cache-busted URL', () => {
    expect(extractAvatarCacheBust(`${OWNED_PATH}?v=123`)).toBe(123)
  })

  it('should return null when the URL has no version param', () => {
    expect(extractAvatarCacheBust(OWNED_PATH)).toBeNull()
  })

  it('should return null for malformed URLs', () => {
    expect(extractAvatarCacheBust('not-a-url')).toBeNull()
  })
})

describe('isOwnedAvatarStorageUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should accept the current user avatar storage path', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL)

    expect(isOwnedAvatarStorageUrl(OWNED_PATH, USER_ID)).toBe(true)
    expect(isOwnedAvatarStorageUrl(`${OWNED_PATH}?v=123`, USER_ID)).toBe(true)
  })

  it('should reject external hosts', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL)

    expect(isOwnedAvatarStorageUrl('https://evil.com/track.png', USER_ID)).toBe(
      false,
    )
  })

  it('should reject external hosts with a matching path suffix', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL)

    const attackerUrl = `https://attacker.example/storage/v1/object/public/avatars/${buildAvatarStoragePath(USER_ID)}`

    expect(isOwnedAvatarStorageUrl(attackerUrl, USER_ID)).toBe(false)
  })

  it('should reject another user avatar path', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL)

    const otherUserPath = `${SUPABASE_URL}/storage/v1/object/public/avatars/${buildAvatarStoragePath(OTHER_USER_ID)}`

    expect(isOwnedAvatarStorageUrl(otherUserPath, USER_ID)).toBe(false)
  })

  it('should reject when Supabase URL env is unset', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')

    expect(isOwnedAvatarStorageUrl(OWNED_PATH, USER_ID)).toBe(false)
  })
})
