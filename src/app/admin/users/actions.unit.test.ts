import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_ROLE } from '@/constants/admin-role'

const getUserMock = vi.fn()
const createClientMock = vi.fn()
const createServiceClientMock = vi.fn()
const promoteUserByIdMock = vi.fn()
const demoteUserByIdMock = vi.fn()
const banUserByIdMock = vi.fn()
const unbanUserByIdMock = vi.fn()
const listAdminUsersPageMock = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: () => createClientMock(),
}))

vi.mock('@/supabase/service', () => ({
  createServiceClient: () => createServiceClientMock(),
}))

vi.mock('@/utils/admin-user-mutations', () => ({
  promoteUserById: (...args: unknown[]) => promoteUserByIdMock(...args),
  demoteUserById: (...args: unknown[]) => demoteUserByIdMock(...args),
  banUserById: (...args: unknown[]) => banUserByIdMock(...args),
  unbanUserById: (...args: unknown[]) => unbanUserByIdMock(...args),
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
          banStatus: null,
        },
      ],
      hasNextPage: false,
      page: 1,
    }
    listAdminUsersPageMock.mockResolvedValue(pageData)

    const { listUsersAction } = await import('./actions')
    const result = await listUsersAction()

    expect(result).toEqual({ success: true, data: pageData })
    expect(createClientMock).toHaveBeenCalled()
    expect(createServiceClientMock).not.toHaveBeenCalled()
    expect(listAdminUsersPageMock).toHaveBeenCalledWith(expect.any(Object), {
      page: 1,
      perPage: 15,
      emailFilter: undefined,
      sortColumn: 'created_at',
      sortDirection: 'desc',
      showBanned: false,
    })
  })

  it('should return VALIDATION_ERROR for invalid page size', async () => {
    const { listUsersAction } = await import('./actions')
    const result = await listUsersAction({ perPage: 20 as 15 })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Page size must be 10, 15, 25, or 50',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(listAdminUsersPageMock).not.toHaveBeenCalled()
  })

  it('should return VALIDATION_ERROR for invalid sort column', async () => {
    const { listUsersAction } = await import('./actions')
    const result = await listUsersAction({
      sortColumn: 'display_name' as 'email',
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Invalid sort column',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(listAdminUsersPageMock).not.toHaveBeenCalled()
  })

  it('should forward sort and page size params', async () => {
    listAdminUsersPageMock.mockResolvedValue({
      rows: [],
      hasNextPage: false,
      page: 2,
    })

    const { listUsersAction } = await import('./actions')
    await listUsersAction({
      page: 2,
      perPage: 50,
      sortColumn: 'role',
      sortDirection: 'asc',
      emailFilter: 'alice',
    })

    expect(listAdminUsersPageMock).toHaveBeenCalledWith(expect.any(Object), {
      page: 2,
      perPage: 50,
      sortColumn: 'role',
      sortDirection: 'asc',
      emailFilter: 'alice',
      showBanned: false,
    })
  })

  it('should forward showBanned true to listAdminUsersPage', async () => {
    listAdminUsersPageMock.mockResolvedValue({
      rows: [],
      hasNextPage: false,
      page: 1,
    })

    const { listUsersAction } = await import('./actions')
    await listUsersAction({ showBanned: true })

    expect(listAdminUsersPageMock).toHaveBeenCalledWith(expect.any(Object), {
      page: 1,
      perPage: 15,
      emailFilter: undefined,
      sortColumn: 'created_at',
      sortDirection: 'desc',
      showBanned: true,
    })
  })

  it('should return VALIDATION_ERROR for non-boolean showBanned', async () => {
    const { listUsersAction } = await import('./actions')
    const result = await listUsersAction({
      showBanned: 'yes' as unknown as boolean,
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Show banned must be a boolean',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(listAdminUsersPageMock).not.toHaveBeenCalled()
  })

  it('should forward banned_until sort column', async () => {
    listAdminUsersPageMock.mockResolvedValue({
      rows: [],
      hasNextPage: false,
      page: 1,
    })

    const { listUsersAction } = await import('./actions')
    await listUsersAction({
      sortColumn: 'banned_until',
      sortDirection: 'desc',
    })

    expect(listAdminUsersPageMock).toHaveBeenCalledWith(expect.any(Object), {
      page: 1,
      perPage: 15,
      emailFilter: undefined,
      sortColumn: 'banned_until',
      sortDirection: 'desc',
      showBanned: false,
    })
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

describe('banUserAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    createServiceClientMock.mockReset()
    promoteUserByIdMock.mockReset()
    demoteUserByIdMock.mockReset()
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
    const { banUserAction } = await import('./actions')
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
    const { banUserAction } = await import('./actions')
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

    const { banUserAction } = await import('./actions')
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

    const { banUserAction } = await import('./actions')
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

    const { banUserAction } = await import('./actions')
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
    promoteUserByIdMock.mockReset()
    demoteUserByIdMock.mockReset()
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

    const { unbanUserAction } = await import('./actions')
    const result = await unbanUserAction({ userId: 'other-user' })

    expect(result).toEqual({
      success: true,
      data: { status: 'unbanned', email: 'bob@example.com' },
    })
  })

  it('should return NOT_FOUND when the user does not exist', async () => {
    unbanUserByIdMock.mockResolvedValue({ status: 'not_found' })

    const { unbanUserAction } = await import('./actions')
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
