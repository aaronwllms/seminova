import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_ROLE } from '@/constants/admin-role'

const getUserMock = vi.fn()
const createClientMock = vi.fn()
const listAppLogsPageMock = vi.fn()
const countFilteredUnreadLogsMock = vi.fn()
const listAppLogStatsMock = vi.fn()
const listAppLogTagsMock = vi.fn()
const markLogReadMock = vi.fn()
const markLogUnreadMock = vi.fn()
const markAllLogsReadMock = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: () => createClientMock(),
}))

vi.mock('./_lib/list-app-logs', () => ({
  listAppLogsPage: (...args: unknown[]) => listAppLogsPageMock(...args),
}))

vi.mock('./_lib/list-app-log-stats', () => ({
  listAppLogStats: (...args: unknown[]) => listAppLogStatsMock(...args),
}))

vi.mock('./_lib/list-app-log-tags', () => ({
  listAppLogTags: (...args: unknown[]) => listAppLogTagsMock(...args),
}))

vi.mock('./_lib/mark-app-logs-read', () => ({
  countFilteredUnreadLogs: (...args: unknown[]) =>
    countFilteredUnreadLogsMock(...args),
  markLogRead: (...args: unknown[]) => markLogReadMock(...args),
  markLogUnread: (...args: unknown[]) => markLogUnreadMock(...args),
  markAllLogsRead: (...args: unknown[]) => markAllLogsReadMock(...args),
}))

const adminUser = {
  id: 'admin-user-id',
  app_metadata: { role: ADMIN_ROLE },
}

const forbiddenEnvelope = {
  success: false,
  error: {
    message: 'Forbidden',
    code: 'FORBIDDEN',
    kind: 'operational',
  },
} as const

const setupAuthenticatedAdmin = () => {
  createClientMock.mockResolvedValue({
    auth: { getUser: getUserMock },
  })
  getUserMock.mockResolvedValue({
    data: { user: adminUser },
    error: null,
  })
}

const setupNonAdmin = () => {
  getUserMock.mockResolvedValue({
    data: { user: { id: 'user-1', app_metadata: {} } },
    error: null,
  })
}

describe('logs actions admin gate', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    listAppLogsPageMock.mockReset()
    listAppLogStatsMock.mockReset()
    listAppLogTagsMock.mockReset()
    markLogReadMock.mockReset()
    markLogUnreadMock.mockReset()
    markAllLogsReadMock.mockReset()
    setupAuthenticatedAdmin()
  })

  it.each([
    [
      'listLogsAction',
      () => import('./actions').then((m) => m.listLogsAction()),
    ],
    [
      'getLogStatsAction',
      () => import('./actions').then((m) => m.getLogStatsAction()),
    ],
    [
      'listLogTagsAction',
      () => import('./actions').then((m) => m.listLogTagsAction()),
    ],
    [
      'markLogReadAction',
      () => import('./actions').then((m) => m.markLogReadAction({ id: 1 })),
    ],
    [
      'markLogUnreadAction',
      () => import('./actions').then((m) => m.markLogUnreadAction({ id: 1 })),
    ],
    [
      'markAllLogsReadAction',
      () => import('./actions').then((m) => m.markAllLogsReadAction()),
    ],
  ])(
    'should return FORBIDDEN when caller is not admin (%s)',
    async (_, run) => {
      setupNonAdmin()
      const result = await run()
      expect(result).toEqual(forbiddenEnvelope)
    },
  )
})

describe('listLogsAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    listAppLogsPageMock.mockReset()
    countFilteredUnreadLogsMock.mockReset()
    setupAuthenticatedAdmin()
    countFilteredUnreadLogsMock.mockResolvedValue(0)
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
          timestampLabel: 'Jul 18, 2:32:07 PM.412',
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

describe('getLogStatsAction', () => {
  beforeEach(() => {
    vi.resetModules()
    createClientMock.mockReset()
    listAppLogStatsMock.mockReset()
    setupAuthenticatedAdmin()
  })

  it('should return success envelope with global stats', async () => {
    const stats = {
      total: 10,
      debug: 1,
      info: 4,
      warn: 2,
      error: 3,
      unread: 5,
    }
    listAppLogStatsMock.mockResolvedValue(stats)

    const { getLogStatsAction } = await import('./actions')
    const result = await getLogStatsAction()

    expect(result).toEqual({
      success: true,
      data: stats,
    })
    expect(listAppLogStatsMock).toHaveBeenCalledWith(expect.any(Object))
  })
})

describe('listLogTagsAction', () => {
  beforeEach(() => {
    vi.resetModules()
    createClientMock.mockReset()
    listAppLogTagsMock.mockReset()
    setupAuthenticatedAdmin()
  })

  it('should return success envelope with distinct tags', async () => {
    listAppLogTagsMock.mockResolvedValue(['auth-session', 'settings-read'])

    const { listLogTagsAction } = await import('./actions')
    const result = await listLogTagsAction()

    expect(result).toEqual({
      success: true,
      data: ['auth-session', 'settings-read'],
    })
    expect(listAppLogTagsMock).toHaveBeenCalledWith(expect.any(Object))
  })
})

describe('mark log read state actions', () => {
  beforeEach(() => {
    vi.resetModules()
    createClientMock.mockReset()
    markLogReadMock.mockReset()
    markLogUnreadMock.mockReset()
    setupAuthenticatedAdmin()
  })

  it.each([
    ['markLogReadAction', markLogReadMock] as const,
    ['markLogUnreadAction', markLogUnreadMock] as const,
  ])(
    'should return VALIDATION_ERROR for an invalid log id (%s)',
    async (actionName, mock) => {
      const actions = await import('./actions')
      const result = await actions[actionName]({ id: 0 })

      expect(result).toEqual({
        success: false,
        error: {
          message: 'Invalid log id',
          code: 'VALIDATION_ERROR',
          kind: 'operational',
        },
      })
      expect(mock).not.toHaveBeenCalled()
    },
  )

  it.each([
    ['markLogReadAction', markLogReadMock] as const,
    ['markLogUnreadAction', markLogUnreadMock] as const,
  ])(
    'should return success envelope after updating read state (%s)',
    async (actionName, mock) => {
      mock.mockResolvedValue(undefined)
      const actions = await import('./actions')
      const result = await actions[actionName]({ id: 42 })

      expect(result).toEqual({
        success: true,
        data: { id: 42 },
      })
      expect(mock).toHaveBeenCalledWith(expect.any(Object), 42)
    },
  )
})

describe('markAllLogsReadAction', () => {
  beforeEach(() => {
    vi.resetModules()
    createClientMock.mockReset()
    markAllLogsReadMock.mockReset()
    setupAuthenticatedAdmin()
  })

  it('should return VALIDATION_ERROR for invalid filters', async () => {
    const { markAllLogsReadAction } = await import('./actions')
    const result = await markAllLogsReadAction({
      filters: { levels: ['bad'] } as never,
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Invalid level filters',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    expect(markAllLogsReadMock).not.toHaveBeenCalled()
  })

  it('should return success envelope with marked count', async () => {
    markAllLogsReadMock.mockResolvedValue(3)

    const { markAllLogsReadAction } = await import('./actions')
    const result = await markAllLogsReadAction({
      filters: {
        levels: ['error'],
        unreadOnly: true,
        tag: null,
        search: null,
      },
    })

    expect(result).toEqual({
      success: true,
      data: { markedCount: 3 },
    })
    expect(markAllLogsReadMock).toHaveBeenCalledWith(expect.any(Object), {
      levels: ['error'],
      unreadOnly: true,
      tag: null,
      search: null,
    })
  })
})
