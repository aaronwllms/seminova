import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

import { getCurrentUserProfile } from './get-current-user-profile'

describe('getCurrentUserProfile', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockFrom.mockReset()
    mockSelect.mockReset()
    mockEq.mockReset()
    mockSingle.mockReset()

    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
  })

  it('should return an empty profile when there is no authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(getCurrentUserProfile()).resolves.toEqual({
      userId: '',
      displayName: null,
      avatarUrl: null,
      bio: null,
      email: '',
      isAdmin: false,
    })
  })

  it('should return profile fields for an authenticated user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'alex@example.com' } },
      error: null,
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
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'alex@example.com' } },
      error: null,
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
