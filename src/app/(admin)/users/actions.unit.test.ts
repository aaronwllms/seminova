import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_ROLE } from '@/constants/admin-role'

const getClaimsMock = vi.fn()
const createClientMock = vi.fn()
const createServiceClientMock = vi.fn()
const promoteUserByIdMock = vi.fn()
const demoteUserByIdMock = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: () => createClientMock(),
}))

vi.mock('@/supabase/service', () => ({
  createServiceClient: () => createServiceClientMock(),
}))

vi.mock('@/utils/admin-role-mutations', () => ({
  promoteUserById: (...args: unknown[]) => promoteUserByIdMock(...args),
  demoteUserById: (...args: unknown[]) => demoteUserByIdMock(...args),
}))

const adminClaims = {
  sub: 'admin-user-id',
  email: 'admin@example.com',
  app_metadata: { role: ADMIN_ROLE },
}

describe('promoteUserAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getClaimsMock.mockReset()
    createClientMock.mockReset()
    createServiceClientMock.mockReset()
    promoteUserByIdMock.mockReset()
    demoteUserByIdMock.mockReset()

    createClientMock.mockResolvedValue({
      auth: { getClaims: getClaimsMock },
    })
    createServiceClientMock.mockReturnValue({})
    getClaimsMock.mockResolvedValue({
      data: { claims: adminClaims },
      error: null,
    })
  })

  it('should return FORBIDDEN when caller is not admin', async () => {
    getClaimsMock.mockResolvedValue({
      data: { claims: { sub: 'user-1', app_metadata: {} } },
      error: null,
    })

    const { promoteUserAction } = await import('./actions')
    const result = await promoteUserAction({ userId: 'target-user' })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Forbidden',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    })
  })

  it('should return FORBIDDEN when sub is missing', async () => {
    getClaimsMock.mockResolvedValue({
      data: { claims: { app_metadata: { role: ADMIN_ROLE } } },
      error: null,
    })

    const { promoteUserAction } = await import('./actions')
    const result = await promoteUserAction({ userId: 'target-user' })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    })
  })

  it('should return success envelope for promoted user', async () => {
    promoteUserByIdMock.mockResolvedValue({
      status: 'promoted',
      email: 'alice@example.com',
    })

    const { promoteUserAction } = await import('./actions')
    const result = await promoteUserAction({ userId: 'target-user' })

    expect(result).toEqual({
      success: true,
      data: { status: 'promoted', email: 'alice@example.com' },
    })
  })
})

describe('demoteUserAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getClaimsMock.mockReset()
    createClientMock.mockReset()
    createServiceClientMock.mockReset()
    promoteUserByIdMock.mockReset()
    demoteUserByIdMock.mockReset()

    createClientMock.mockResolvedValue({
      auth: { getClaims: getClaimsMock },
    })
    createServiceClientMock.mockReturnValue({})
    getClaimsMock.mockResolvedValue({
      data: { claims: adminClaims },
      error: null,
    })
  })

  it('should block self-demotion with VALIDATION_ERROR', async () => {
    const { demoteUserAction } = await import('./actions')
    const result = await demoteUserAction({ userId: 'admin-user-id' })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'You cannot demote your own admin account',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(demoteUserByIdMock).not.toHaveBeenCalled()
  })

  it('should return success envelope for idempotent not_admin', async () => {
    demoteUserByIdMock.mockResolvedValue({
      status: 'not_admin',
      email: 'bob@example.com',
    })

    const { demoteUserAction } = await import('./actions')
    const result = await demoteUserAction({ userId: 'other-user' })

    expect(result).toEqual({
      success: true,
      data: { status: 'not_admin', email: 'bob@example.com' },
    })
  })
})
