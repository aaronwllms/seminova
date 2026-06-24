import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildAvatarStoragePath } from '@/constants/storage-paths'

const mockGetUser = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockGetPublicUrl = vi.fn()

const USER_ID = 'user-1'
const CANONICAL_PUBLIC_URL = `https://example.supabase.co/storage/v1/object/public/avatars/${buildAvatarStoragePath(USER_ID)}`

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: mockGetPublicUrl,
      })),
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
    mockGetPublicUrl.mockReset()

    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: CANONICAL_PUBLIC_URL },
    })

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      select: mockSelect,
    })
    mockSelect.mockReturnValue({
      single: mockSingle,
    })

    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    })
  })

  it('should return operational error when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await updateProfileAction({ displayName: 'Alex' })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'UNAUTHORIZED', kind: 'operational' },
    })
  })

  it('should reject empty partial payload', async () => {
    const result = await updateProfileAction({})

    expect(result).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR', kind: 'operational' },
    })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return validation error for invalid avatar URL', async () => {
    const result = await updateProfileAction({ avatarUrl: 'not-a-url' })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR', kind: 'operational' },
    })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should persist only provided fields for authenticated users', async () => {
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url: null,
        bio: 'Builder',
      },
      error: null,
    })

    const result = await updateProfileAction({
      displayName: 'Alex',
      bio: 'Builder',
    })

    expect(mockUpdate).toHaveBeenCalledWith({
      display_name: 'Alex',
      bio: 'Builder',
    })
    expect(result).toMatchObject({
      success: true,
      data: {
        displayName: 'Alex',
        bio: 'Builder',
      },
    })
  })

  it('should update a single field', async () => {
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Jordan',
        avatar_url: null,
        bio: null,
      },
      error: null,
    })

    const result = await updateProfileAction({ displayName: 'Jordan' })

    expect(mockUpdate).toHaveBeenCalledWith({ display_name: 'Jordan' })
    expect(result).toMatchObject({
      success: true,
      data: { displayName: 'Jordan' },
    })
  })

  it('should rebuild owned avatar URL via getPublicUrl', async () => {
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url: `${CANONICAL_PUBLIC_URL}?v=1`,
        bio: null,
      },
      error: null,
    })

    const result = await updateProfileAction({
      avatarUrl: `${CANONICAL_PUBLIC_URL}?v=1`,
    })

    expect(mockGetPublicUrl).toHaveBeenCalledWith(
      buildAvatarStoragePath(USER_ID),
    )
    expect(mockUpdate).toHaveBeenCalledWith({
      avatar_url: `${CANONICAL_PUBLIC_URL}?v=1`,
    })
    expect(result).toMatchObject({ success: true })
  })

  it('should preserve client cache-bust version on owned avatar URLs', async () => {
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url: `${CANONICAL_PUBLIC_URL}?v=123`,
        bio: null,
      },
      error: null,
    })

    await updateProfileAction({
      avatarUrl: `${CANONICAL_PUBLIC_URL}?v=123`,
    })

    expect(mockUpdate).toHaveBeenCalledWith({
      avatar_url: `${CANONICAL_PUBLIC_URL}?v=123`,
    })
  })

  it('should omit avatar_url when client sends an external URL', async () => {
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url: null,
        bio: null,
      },
      error: null,
    })

    const result = await updateProfileAction({
      avatarUrl: 'https://evil.com/track.png',
    })

    expect(mockGetPublicUrl).not.toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith({})
    expect(mockUpdate.mock.calls[0]?.[0]).not.toHaveProperty('avatar_url')
    expect(result).toMatchObject({ success: true })
  })

  it('should omit avatar_url when client sends another user avatar path', async () => {
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url: null,
        bio: null,
      },
      error: null,
    })

    const otherUserPath = `https://example.supabase.co/storage/v1/object/public/avatars/${buildAvatarStoragePath('other-user')}`

    await updateProfileAction({
      avatarUrl: otherUserPath,
    })

    expect(mockGetPublicUrl).not.toHaveBeenCalled()
    expect(mockUpdate.mock.calls[0]?.[0]).not.toHaveProperty('avatar_url')
  })

  it('should clear avatar_url when client sends null', async () => {
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url: null,
        bio: null,
      },
      error: null,
    })

    await updateProfileAction({ avatarUrl: null })

    expect(mockGetPublicUrl).not.toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith({ avatar_url: null })
  })

  it('should return fault error when profile update fails', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'db error' },
    })

    const result = await updateProfileAction({ displayName: 'Alex' })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'INTERNAL_ERROR', kind: 'fault' },
    })
  })
})
