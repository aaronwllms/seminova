import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_ROLE } from '@/constants/admin-role'

const getUserMock = vi.fn()
const createClientMock = vi.fn()
const listAppLogsPageMock = vi.fn()
const countFilteredUnreadLogsMock = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: () => createClientMock(),
}))

vi.mock('./_lib/list-app-logs', () => ({
  listAppLogsPage: (...args: unknown[]) => listAppLogsPageMock(...args),
}))

vi.mock('./_lib/mark-app-logs-read', () => ({
  countFilteredUnreadLogs: (...args: unknown[]) =>
    countFilteredUnreadLogsMock(...args),
  markLogRead: vi.fn(),
  markAllLogsRead: vi.fn(),
}))

const adminUser = {
  id: 'admin-user-id',
  app_metadata: { role: ADMIN_ROLE },
}

describe('listLogsAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    listAppLogsPageMock.mockReset()
    countFilteredUnreadLogsMock.mockReset()

    createClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
    })
    getUserMock.mockResolvedValue({
      data: { user: adminUser },
      error: null,
    })
    countFilteredUnreadLogsMock.mockResolvedValue(0)
  })

  it('should return FORBIDDEN when caller is not admin', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-1', app_metadata: {} } },
      error: null,
    })

    const { listLogsAction } = await import('./actions')
    const result = await listLogsAction()

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Forbidden',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    })
    expect(listAppLogsPageMock).not.toHaveBeenCalled()
  })

  it('should return VALIDATION_ERROR for invalid page size', async () => {
    const { listLogsAction } = await import('./actions')
    const result = await listLogsAction({ perPage: 20 as 15 })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Page size must be 10, 15, 25, or 50',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(listAppLogsPageMock).not.toHaveBeenCalled()
  })

  it('should return VALIDATION_ERROR for a malformed cursor timestamp', async () => {
    const { listLogsAction } = await import('./actions')
    const result = await listLogsAction({
      cursor: { createdAt: 'not-a-timestamp', id: 1 },
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Invalid cursor',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(listAppLogsPageMock).not.toHaveBeenCalled()
  })

  it('should return success envelope with listed logs and filtered unread count', async () => {
    const pageData = {
      rows: [
        {
          id: 1,
          level: 'info' as const,
          tag: 'settings-read',
          message: 'Cache hit',
          context: null,
          createdAt: '2026-07-18T14:32:07.412Z',
          timestampLabel: 'Jul 18, 2026, 2:32:07 PM.412',
          readAt: null,
          isUnread: true,
        },
      ],
      hasNextPage: false,
    }
    listAppLogsPageMock.mockResolvedValue(pageData)
    countFilteredUnreadLogsMock.mockResolvedValue(3)

    const { listLogsAction } = await import('./actions')
    const result = await listLogsAction()

    expect(result).toEqual({
      success: true,
      data: {
        ...pageData,
        filteredUnreadCount: 3,
      },
    })
    expect(listAppLogsPageMock).toHaveBeenCalledWith(expect.any(Object), {
      cursor: null,
      sortDirection: 'desc',
      perPage: 15,
      filters: {
        levels: [],
        unreadOnly: false,
        tag: null,
        search: null,
      },
    })
  })
})
