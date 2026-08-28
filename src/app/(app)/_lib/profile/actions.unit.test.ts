import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildAvatarStoragePath } from '@/constants/storage-paths'

const mockGetUser = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockGetPublicUrl = vi.fn()
const mockRemove = vi.fn()
const mockAppLogDebug = vi.fn()
const mockAppLogWarn = vi.fn()
const mockAppLogError = vi.fn()
const mockServiceUpdate = vi.fn()
const mockServiceEq = vi.fn()
const mockUpdateUserById = vi.fn()

vi.mock('@/utils/app-logger', () => ({
  appLog: {
    debug: (...args: unknown[]) => mockAppLogDebug(...args),
    info: vi.fn(),
    warn: (...args: unknown[]) => mockAppLogWarn(...args),
    error: (...args: unknown[]) => mockAppLogError(...args),
  },
}))

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
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: mockSelect,
          update: mockUpdate,
        }
      }
      return { update: mockUpdate }
    }),
  })),
}))

vi.mock('@/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    auth: {
      admin: {
        updateUserById: mockUpdateUserById,
      },
    },
    from: vi.fn(() => ({
      update: mockServiceUpdate,
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

import {
  markHasPasswordAction,
  setFirstPasswordAction,
  updateProfileAction,
} from './actions'

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
    mockAppLogDebug.mockReset()
    mockAppLogWarn.mockReset()
    mockAppLogError.mockReset()
    mockServiceUpdate.mockReset()
    mockServiceEq.mockReset()
    mockUpdateUserById.mockReset()

    mockServiceUpdate.mockReturnValue({ eq: mockServiceEq })
    mockServiceEq.mockResolvedValue({ error: null })
    mockUpdateUserById.mockResolvedValue({ error: null })

    mockSelect.mockReturnValue({ eq: mockEq })

    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: CANONICAL_PUBLIC_URL },
    })

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockImplementation(() => ({
      select: mockSelect,
      single: mockSingle,
    }))
    mockSelect.mockImplementation(() => ({
      eq: mockEq,
      single: mockSingle,
    }))

    mockRemove.mockResolvedValue({ data: [], error: null })

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
    expect(mockAppLogDebug).toHaveBeenCalledWith(
      'profile-update',
      'Avatar storage deleted',
      { userId: USER_ID },
    )
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
    expect(mockAppLogWarn).toHaveBeenCalledWith(
      'profile-update',
      'Avatar storage delete failed',
      { message: 'storage delete failed' },
    )
    expect(mockAppLogDebug).toHaveBeenCalledWith(
      'profile-update',
      'Profile updated; avatar storage delete failed without blocking success',
      { storageDeleteOk: false },
    )
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

describe('setFirstPasswordAction', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    })
    mockSingle.mockResolvedValue({
      data: { has_password: false },
      error: null,
    })
    mockServiceUpdate.mockClear()
    mockServiceEq.mockClear()
    mockUpdateUserById.mockClear()
  })

  it('should return operational error when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await setFirstPasswordAction({ password: 'password123' })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'UNAUTHORIZED', kind: 'operational' },
    })
    expect(mockUpdateUserById).not.toHaveBeenCalled()
  })

  it('should reject when account already has a password', async () => {
    mockSingle.mockResolvedValue({
      data: { has_password: true },
      error: null,
    })

    const result = await setFirstPasswordAction({ password: 'password123' })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR', kind: 'operational' },
    })
    expect(mockServiceUpdate).not.toHaveBeenCalled()
    expect(mockUpdateUserById).not.toHaveBeenCalled()
  })

  it('should set flag then update password on happy path', async () => {
    const result = await setFirstPasswordAction({ password: 'password123' })

    expect(mockServiceUpdate).toHaveBeenCalledWith({ has_password: true })
    expect(mockUpdateUserById).toHaveBeenCalledWith(USER_ID, {
      password: 'password123',
    })
    expect(result).toMatchObject({ success: true })
  })

  it('should return fault when password update fails after flag write', async () => {
    mockUpdateUserById.mockResolvedValue({
      error: { message: 'password update failed' },
    })

    const result = await setFirstPasswordAction({ password: 'password123' })

    expect(mockServiceUpdate).toHaveBeenCalledWith({ has_password: true })
    expect(result).toMatchObject({
      success: false,
      error: { code: 'INTERNAL_ERROR', kind: 'fault' },
    })
  })
})

describe('markHasPasswordAction', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    })
    mockServiceUpdate.mockClear()
    mockServiceEq.mockClear()
  })

  it('should return operational error when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await markHasPasswordAction()

    expect(result).toMatchObject({
      success: false,
      error: { code: 'UNAUTHORIZED', kind: 'operational' },
    })
    expect(mockServiceUpdate).not.toHaveBeenCalled()
  })

  it('should set has_password true on happy path', async () => {
    const result = await markHasPasswordAction()

    expect(mockServiceUpdate).toHaveBeenCalledWith({ has_password: true })
    expect(result).toMatchObject({ success: true })
  })
})
