import { describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      update: mockUpdate,
    })),
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { updateProfileAction } from './actions'

describe('updateProfileAction', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockUpdate.mockReset()
    mockEq.mockReset()
    mockSelect.mockReset()
    mockSingle.mockReset()

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      select: mockSelect,
    })
    mockSelect.mockReturnValue({
      single: mockSingle,
    })
  })

  it('should return operational error when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await updateProfileAction({
      displayName: 'Alex',
      bio: null,
      avatarUrl: null,
    })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'UNAUTHORIZED', kind: 'operational' },
    })
  })

  it('should return validation error for invalid avatar URL', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const result = await updateProfileAction({
      displayName: 'Alex',
      bio: null,
      avatarUrl: 'not-a-url',
    })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR', kind: 'operational' },
    })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should persist profile updates for authenticated users', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url:
          'https://example.supabase.co/storage/v1/object/public/avatars/user-1/avatar.webp?v=1',
        bio: 'Builder',
      },
      error: null,
    })

    const result = await updateProfileAction({
      displayName: 'Alex',
      bio: 'Builder',
      avatarUrl:
        'https://example.supabase.co/storage/v1/object/public/avatars/user-1/avatar.webp?v=1',
    })

    expect(mockUpdate).toHaveBeenCalledWith({
      display_name: 'Alex',
      bio: 'Builder',
      avatar_url:
        'https://example.supabase.co/storage/v1/object/public/avatars/user-1/avatar.webp?v=1',
    })
    expect(result).toMatchObject({
      success: true,
      data: {
        displayName: 'Alex',
        bio: 'Builder',
      },
    })
  })

  it('should return fault error when profile update fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'db error' },
    })

    const result = await updateProfileAction({
      displayName: 'Alex',
      bio: null,
      avatarUrl: null,
    })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'INTERNAL_ERROR', kind: 'fault' },
    })
  })
})
