import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_ROLE } from '@/constants/admin-role'

const getUserMock = vi.fn()
const createClientMock = vi.fn()
const createServiceClientMock = vi.fn()
const banUserByIdMock = vi.fn()
const unbanUserByIdMock = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: () => createClientMock(),
}))

vi.mock('@/supabase/service', () => ({
  createServiceClient: () => createServiceClientMock(),
}))

vi.mock('@/utils/admin-user-mutations', () => ({
  banUserById: (...args: unknown[]) => banUserByIdMock(...args),
  unbanUserById: (...args: unknown[]) => unbanUserByIdMock(...args),
}))

const adminUser = {
  id: 'admin-user-id',
  app_metadata: { role: ADMIN_ROLE },
}

describe('banUserAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    createServiceClientMock.mockReset()
    banUserByIdMock.mockReset()
    unbanUserByIdMock.mockReset()

    createClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
    })
    createServiceClientMock.mockReturnValue({})
    getUserMock.mockResolvedValue({
      data: { user: adminUser },
      error: null,
    })
  })

  it('should block self-ban with VALIDATION_ERROR', async () => {
    const { banUserAction } = await import('../actions')
    const result = await banUserAction({
      userId: 'admin-user-id',
      banDuration: '24h',
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'You cannot ban your own account',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(banUserByIdMock).not.toHaveBeenCalled()
  })

  it('should return VALIDATION_ERROR for invalid ban duration', async () => {
    const { banUserAction } = await import('../actions')
    const result = await banUserAction({
      userId: 'other-user',
      banDuration: 'forever',
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Invalid ban duration',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(banUserByIdMock).not.toHaveBeenCalled()
  })

  it('should return success envelope for banned user', async () => {
    banUserByIdMock.mockResolvedValue({
      status: 'banned',
      email: 'bob@example.com',
    })

    const { banUserAction } = await import('../actions')
    const result = await banUserAction({
      userId: 'other-user',
      banDuration: '168h',
    })

    expect(result).toEqual({
      success: true,
      data: { status: 'banned', email: 'bob@example.com' },
    })
  })

  it('should return NOT_FOUND when the user does not exist', async () => {
    banUserByIdMock.mockResolvedValue({ status: 'not_found' })

    const { banUserAction } = await import('../actions')
    const result = await banUserAction({
      userId: 'missing-user',
      banDuration: '24h',
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'User not found',
        code: 'NOT_FOUND',
        kind: 'operational',
      },
    })
  })

  it('should return INTERNAL_ERROR when the service client fails', async () => {
    createServiceClientMock.mockImplementation(() => {
      throw new Error('service unavailable')
    })

    const { banUserAction } = await import('../actions')
    const result = await banUserAction({
      userId: 'other-user',
      banDuration: '24h',
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Something went wrong banning this user. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })
  })
})

describe('unbanUserAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    createServiceClientMock.mockReset()
    banUserByIdMock.mockReset()
    unbanUserByIdMock.mockReset()

    createClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
    })
    createServiceClientMock.mockReturnValue({})
    getUserMock.mockResolvedValue({
      data: { user: adminUser },
      error: null,
    })
  })

  it('should return success envelope for unbanned user', async () => {
    unbanUserByIdMock.mockResolvedValue({
      status: 'unbanned',
      email: 'bob@example.com',
    })

    const { unbanUserAction } = await import('../actions')
    const result = await unbanUserAction({ userId: 'other-user' })

    expect(result).toEqual({
      success: true,
      data: { status: 'unbanned', email: 'bob@example.com' },
    })
  })

  it('should return NOT_FOUND when the user does not exist', async () => {
    unbanUserByIdMock.mockResolvedValue({ status: 'not_found' })

    const { unbanUserAction } = await import('../actions')
    const result = await unbanUserAction({ userId: 'missing-user' })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'User not found',
        code: 'NOT_FOUND',
        kind: 'operational',
      },
    })
  })
})
