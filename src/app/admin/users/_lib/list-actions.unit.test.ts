import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_ROLE } from '@/constants/admin-role'

const getUserMock = vi.fn()
const createClientMock = vi.fn()
const listAdminUsersPageMock = vi.fn()
const listAdminUserStatsMock = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: () => createClientMock(),
}))

vi.mock('./list-admin-users', () => ({
  listAdminUsersPage: (...args: unknown[]) => listAdminUsersPageMock(...args),
}))

vi.mock('./list-admin-user-stats', () => ({
  listAdminUserStats: (...args: unknown[]) => listAdminUserStatsMock(...args),
}))

const adminUser = {
  id: 'admin-user-id',
  app_metadata: { role: ADMIN_ROLE },
}

describe('listUsersAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    listAdminUsersPageMock.mockReset()
    listAdminUserStatsMock.mockReset()

    createClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
    })
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

    const { listUsersAction } = await import('../actions')
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

    const { listUsersAction } = await import('../actions')
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
    const { listUsersAction } = await import('../actions')
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

    const { listUsersAction } = await import('../actions')
    const result = await listUsersAction()

    expect(result).toEqual({ success: true, data: pageData })
    expect(createClientMock).toHaveBeenCalled()
    expect(listAdminUsersPageMock).toHaveBeenCalledWith(expect.any(Object), {
      page: 1,
      perPage: 15,
      emailFilter: undefined,
      sortColumn: 'created_at',
      sortDirection: 'desc',
      filterUnverified: false,
      filterBanned: false,
      filterNew30d: false,
    })
  })

  it('should return VALIDATION_ERROR for invalid page size', async () => {
    const { listUsersAction } = await import('../actions')
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
    const { listUsersAction } = await import('../actions')
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

    const { listUsersAction } = await import('../actions')
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
      filterUnverified: false,
      filterBanned: false,
      filterNew30d: false,
    })
  })

  it('should forward filter flags to listAdminUsersPage', async () => {
    listAdminUsersPageMock.mockResolvedValue({
      rows: [],
      hasNextPage: false,
      page: 1,
    })

    const { listUsersAction } = await import('../actions')
    await listUsersAction({ filterUnverified: true, filterBanned: true })

    expect(listAdminUsersPageMock).toHaveBeenCalledWith(expect.any(Object), {
      page: 1,
      perPage: 15,
      emailFilter: undefined,
      sortColumn: 'created_at',
      sortDirection: 'desc',
      filterUnverified: true,
      filterBanned: true,
      filterNew30d: false,
    })
  })

  it('should return VALIDATION_ERROR for non-boolean filterNew30d', async () => {
    const { listUsersAction } = await import('../actions')
    const result = await listUsersAction({
      filterNew30d: 'yes' as unknown as boolean,
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'New (30d) filter must be a boolean',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(listAdminUsersPageMock).not.toHaveBeenCalled()
  })

  it('should return VALIDATION_ERROR for non-boolean filterUnverified', async () => {
    const { listUsersAction } = await import('../actions')
    const result = await listUsersAction({
      filterUnverified: 'yes' as unknown as boolean,
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Unverified filter must be a boolean',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(listAdminUsersPageMock).not.toHaveBeenCalled()
  })

  it('should return VALIDATION_ERROR for non-boolean filterBanned', async () => {
    const { listUsersAction } = await import('../actions')
    const result = await listUsersAction({
      filterBanned: 'yes' as unknown as boolean,
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Banned filter must be a boolean',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(listAdminUsersPageMock).not.toHaveBeenCalled()
  })

  it('should return VALIDATION_ERROR for non-string emailFilter', async () => {
    const { listUsersAction } = await import('../actions')
    const result = await listUsersAction({
      emailFilter: 1 as unknown as string,
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Email filter must be a string',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(listAdminUsersPageMock).not.toHaveBeenCalled()
  })

  it('should return VALIDATION_ERROR when emailFilter exceeds max length', async () => {
    const { listUsersAction } = await import('../actions')
    const result = await listUsersAction({
      emailFilter: 'a'.repeat(201),
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Email filter must be 200 characters or fewer',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(listAdminUsersPageMock).not.toHaveBeenCalled()
  })

  it('should forward a 200-character emailFilter', async () => {
    const emailFilter = 'a'.repeat(200)
    listAdminUsersPageMock.mockResolvedValue({
      rows: [],
      hasNextPage: false,
      page: 1,
    })

    const { listUsersAction } = await import('../actions')
    await listUsersAction({ emailFilter })

    expect(listAdminUsersPageMock).toHaveBeenCalledWith(expect.any(Object), {
      page: 1,
      perPage: 15,
      emailFilter,
      sortColumn: 'created_at',
      sortDirection: 'desc',
      filterUnverified: false,
      filterBanned: false,
      filterNew30d: false,
    })
  })

  it('should forward banned_until sort column', async () => {
    listAdminUsersPageMock.mockResolvedValue({
      rows: [],
      hasNextPage: false,
      page: 1,
    })

    const { listUsersAction } = await import('../actions')
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
      filterUnverified: false,
      filterBanned: false,
      filterNew30d: false,
    })
  })

  it('should return INTERNAL_ERROR when listAdminUsersPage throws', async () => {
    listAdminUsersPageMock.mockRejectedValue(new Error('db down'))

    const { listUsersAction } = await import('../actions')
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

describe('getUserStatsAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    listAdminUserStatsMock.mockReset()

    createClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
    })
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

    const { getUserStatsAction } = await import('../actions')
    const result = await getUserStatsAction()

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Forbidden',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    })
    expect(listAdminUserStatsMock).not.toHaveBeenCalled()
  })

  it('should return success envelope with stats', async () => {
    listAdminUserStatsMock.mockResolvedValue({
      total: 10,
      unverified: 2,
      banned: 1,
      new30d: 4,
    })

    const { getUserStatsAction } = await import('../actions')
    const result = await getUserStatsAction()

    expect(result).toEqual({
      success: true,
      data: { total: 10, unverified: 2, banned: 1, new30d: 4 },
    })
    expect(listAdminUserStatsMock).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should return INTERNAL_ERROR when listAdminUserStats throws', async () => {
    listAdminUserStatsMock.mockRejectedValue(new Error('db down'))

    const { getUserStatsAction } = await import('../actions')
    const result = await getUserStatsAction()

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Something went wrong loading user stats. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })
  })
})
