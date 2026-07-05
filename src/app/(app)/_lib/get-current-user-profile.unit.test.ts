import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockRequireAuthClaims = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}))

vi.mock('@/supabase/require-auth', () => ({
  requireAuthClaims: (...args: unknown[]) => mockRequireAuthClaims(...args),
}))

import { getCurrentUserProfile } from './get-current-user-profile'

describe('getCurrentUserProfile', () => {
  beforeEach(() => {
    mockRequireAuthClaims.mockReset()
    mockFrom.mockReset()
    mockSelect.mockReset()
    mockEq.mockReset()
    mockSingle.mockReset()

    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
  })

  it('should redirect when there is no authenticated session', async () => {
    mockRequireAuthClaims.mockRejectedValue(new Error('NEXT_REDIRECT'))

    await expect(getCurrentUserProfile()).rejects.toThrow('NEXT_REDIRECT')
  })

  it('should return profile fields for an authenticated user', async () => {
    mockRequireAuthClaims.mockResolvedValue({
      sub: 'user-1',
      email: 'alex@example.com',
      app_metadata: {},
    })
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url: 'https://example.test/avatar.webp?v=1',
        bio: 'Builder',
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
    })
  })

  it('should tolerate profile read errors and still return the email', async () => {
    mockRequireAuthClaims.mockResolvedValue({
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
    })
  })
})
