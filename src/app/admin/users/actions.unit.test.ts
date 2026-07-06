import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_ROLE } from '@/constants/admin-role'

const getUserMock = vi.fn()
const createClientMock = vi.fn()
const createServiceClientMock = vi.fn()
const promoteUserByIdMock = vi.fn()
const demoteUserByIdMock = vi.fn()
const listAdminUsersPageMock = vi.fn()

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

vi.mock('./_lib/list-admin-users', () => ({
  listAdminUsersPage: (...args: unknown[]) => listAdminUsersPageMock(...args),
}))

const adminUser = {
  id: 'admin-user-id',
  app_metadata: { role: ADMIN_ROLE },
}

describe('promoteUserAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    createServiceClientMock.mockReset()
    promoteUserByIdMock.mockReset()
    demoteUserByIdMock.mockReset()

    createClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
    })
    createServiceClientMock.mockReturnValue({})
    getUserMock.mockResolvedValue({
      data: { user: adminUser },
      error: null,
    })
  })

  it('should return FORBIDDEN when caller is not admin', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-1', app_metadata: {} } },
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

  it('should return FORBIDDEN when user id is missing', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: '', app_metadata: { role: ADMIN_ROLE } } },
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

  it('should return NOT_FOUND when the user does not exist', async () => {
    promoteUserByIdMock.mockResolvedValue({
      status: 'not_found',
      email: 'missing@example.com',
    })

    const { promoteUserAction } = await import('./actions')
    const result = await promoteUserAction({ userId: 'missing-user' })

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

    const { promoteUserAction } = await import('./actions')
    const result = await promoteUserAction({ userId: 'target-user' })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Something went wrong promoting this user. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })
  })
})

describe('demoteUserAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    createServiceClientMock.mockReset()
    promoteUserByIdMock.mockReset()
    demoteUserByIdMock.mockReset()

    createClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
    })
    createServiceClientMock.mockReturnValue({})
    getUserMock.mockResolvedValue({
      data: { user: adminUser },
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

  it('should return NOT_FOUND when the user does not exist', async () => {
    demoteUserByIdMock.mockResolvedValue({
      status: 'not_found',
      email: 'missing@example.com',
    })

    const { demoteUserAction } = await import('./actions')
    const result = await demoteUserAction({ userId: 'missing-user' })

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

    const { demoteUserAction } = await import('./actions')
    const result = await demoteUserAction({ userId: 'other-user' })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Something went wrong demoting this user. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })
  })
})

describe('listUsersAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    createServiceClientMock.mockReset()
    listAdminUsersPageMock.mockReset()

    createClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
    })
    createServiceClientMock.mockReturnValue({})
    getUserMock.mockResolvedValue({
      data: { user: adminUser },
      error: null,
    })
  })

  it('should return FORBIDDEN when caller is not admin', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-1', app_metadata: {} } },
      error: null,
    })

    const { listUsersAction } = await import('./actions')
    const result = await listUsersAction()

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Forbidden',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    })
    expect(listAdminUsersPageMock).not.toHaveBeenCalled()
  })

  it('should return FORBIDDEN when getUser returns an error', async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error('session invalid'),
    })

    const { listUsersAction } = await import('./actions')
    const result = await listUsersAction()

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    })
    expect(listAdminUsersPageMock).not.toHaveBeenCalled()
  })

  it('should return VALIDATION_ERROR for invalid page', async () => {
    const { listUsersAction } = await import('./actions')
    const result = await listUsersAction({ page: 0 })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Page must be a positive integer',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(listAdminUsersPageMock).not.toHaveBeenCalled()
  })

  it('should return success envelope with listed users', async () => {
    const pageData = {
      rows: [
        {
          id: 'user-1',
          email: 'alice@example.com',
          isVerified: true,
          createdAtLabel: 'Jun 1, 2024',
          lastSignInAtLabel: 'Jun 2, 2024',
          isAdmin: false,
        },
      ],
      hasNextPage: false,
      page: 1,
    }
    listAdminUsersPageMock.mockResolvedValue(pageData)

    const { listUsersAction } = await import('./actions')
    const result = await listUsersAction()

    expect(result).toEqual({ success: true, data: pageData })
    expect(createServiceClientMock).toHaveBeenCalled()
    expect(listAdminUsersPageMock).toHaveBeenCalledWith(
      {},
      { page: 1, emailFilter: undefined },
    )
  })

  it('should return INTERNAL_ERROR when listAdminUsersPage throws', async () => {
    listAdminUsersPageMock.mockRejectedValue(new Error('db down'))

    const { listUsersAction } = await import('./actions')
    const result = await listUsersAction()

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Something went wrong loading users. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })
  })
})
