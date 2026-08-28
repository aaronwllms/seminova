import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetDisplayAuthClaims = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}))

vi.mock('@/supabase/require-auth', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/supabase/require-auth')>()
  return {
    ...actual,
    getDisplayAuthClaims: (...args: unknown[]) =>
      mockGetDisplayAuthClaims(...args),
  }
})

import { DisplayAuthInvariantError } from '@/supabase/require-auth'

import { getCurrentUserProfile } from './get-current-user-profile'

describe('getCurrentUserProfile', () => {
  beforeEach(() => {
    mockGetDisplayAuthClaims.mockReset()
    mockFrom.mockReset()
    mockSelect.mockReset()
    mockEq.mockReset()
    mockSingle.mockReset()

    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
  })

  it('should throw when display claims are unavailable', async () => {
    mockGetDisplayAuthClaims.mockRejectedValue(
      new DisplayAuthInvariantError('No authenticated session'),
    )

    await expect(getCurrentUserProfile()).rejects.toBeInstanceOf(
      DisplayAuthInvariantError,
    )
  })

  it('should return profile fields for an authenticated user', async () => {
    mockGetDisplayAuthClaims.mockResolvedValue({
      sub: 'user-1',
      email: 'alex@example.com',
      app_metadata: {},
    })
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url: 'https://example.test/avatar.webp?v=1',
        bio: 'Builder',
        has_password: true,
      },
      error: null,
    })

    await expect(getCurrentUserProfile()).resolves.toEqual({
      userId: 'user-1',
      displayName: 'Alex',
      avatarUrl: 'https://example.test/avatar.webp?v=1',
      bio: 'Builder',
      email: 'alex@example.com',
      isAdmin: false,
      hasPassword: true,
      profileLoadFailed: false,
    })
  })

  it('should set profileLoadFailed when the profile read errors', async () => {
    mockGetDisplayAuthClaims.mockResolvedValue({
      sub: 'user-1',
      email: 'alex@example.com',
      app_metadata: {},
    })
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    })

    await expect(getCurrentUserProfile()).resolves.toEqual({
      userId: 'user-1',
      displayName: null,
      avatarUrl: null,
      bio: null,
      email: 'alex@example.com',
      isAdmin: false,
      hasPassword: true,
      profileLoadFailed: true,
    })
  })
})
