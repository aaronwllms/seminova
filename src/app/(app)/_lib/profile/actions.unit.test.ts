import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildAvatarStoragePath } from '@/constants/storage-paths'

const mockGetUser = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockGetPublicUrl = vi.fn()
const mockRemove = vi.fn()

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
        remove: mockRemove,
      })),
    },
    from: vi.fn(() => ({
      update: mockUpdate,
    })),
  })),
}))

vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>()

  return {
    ...actual,
    revalidatePath: vi.fn(),
  }
})

import { updateProfileAction } from './actions'

describe('updateProfileAction', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    mockGetUser.mockReset()
    mockUpdate.mockReset()
    mockEq.mockReset()
    mockSelect.mockReset()
    mockSingle.mockReset()
    mockGetPublicUrl.mockReset()
    mockRemove.mockReset()

    mockRemove.mockResolvedValue({ data: [], error: null })

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

  afterEach(() => {
    vi.unstubAllEnvs()
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

  it('should reject a non-owned avatar URL with a validation error', async () => {
    const result = await updateProfileAction({
      avatarUrl: 'https://evil.com/track.png',
    })

    expect(result).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        kind: 'operational',
        message: 'Could not save your profile photo. Please try again.',
      },
    })
    expect(mockGetPublicUrl).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should reject another user avatar path with a validation error', async () => {
    const otherUserPath = `https://example.supabase.co/storage/v1/object/public/avatars/${buildAvatarStoragePath('other-user')}`

    const result = await updateProfileAction({
      avatarUrl: otherUserPath,
    })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR', kind: 'operational' },
    })
    expect(mockGetPublicUrl).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should clear avatar_url when client sends null', async () => {
    const callOrder: string[] = []

    mockUpdate.mockImplementation(() => {
      callOrder.push('update')
      return { eq: mockEq }
    })
    mockRemove.mockImplementation(async () => {
      callOrder.push('remove')
      return { data: [], error: null }
    })

    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url: null,
        bio: null,
      },
      error: null,
    })

    const result = await updateProfileAction({ avatarUrl: null })

    expect(mockGetPublicUrl).not.toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith({ avatar_url: null })
    expect(mockRemove).toHaveBeenCalledWith([buildAvatarStoragePath(USER_ID)])
    expect(callOrder).toEqual(['update', 'remove'])
    expect(result).toMatchObject({ success: true })
  })

  it('should return success when avatar storage delete fails after row update', async () => {
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url: null,
        bio: null,
      },
      error: null,
    })
    mockRemove.mockResolvedValue({
      data: null,
      error: { message: 'storage delete failed' },
    })

    const result = await updateProfileAction({ avatarUrl: null })

    expect(mockUpdate).toHaveBeenCalledWith({ avatar_url: null })
    expect(mockRemove).toHaveBeenCalled()
    expect(result).toMatchObject({ success: true })
  })

  it('should return success when avatar storage delete throws after row update', async () => {
    mockSingle.mockResolvedValue({
      data: {
        display_name: 'Alex',
        avatar_url: null,
        bio: null,
      },
      error: null,
    })
    mockRemove.mockRejectedValue(new Error('storage delete threw'))

    const result = await updateProfileAction({ avatarUrl: null })

    expect(mockUpdate).toHaveBeenCalledWith({ avatar_url: null })
    expect(mockRemove).toHaveBeenCalledWith([buildAvatarStoragePath(USER_ID)])
    expect(result).toMatchObject({ success: true })
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
