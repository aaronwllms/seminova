import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAdminLogsTableState } from './use-admin-logs-table-state'

const refreshMock = vi.fn()

vi.mock('./use-admin-logs-realtime', () => ({
  useAdminLogsRealtime: () => ({
    refresh: refreshMock,
    isRefreshing: false,
  }),
}))

const listLogsActionMock = vi.fn()
const getLogStatsActionMock = vi.fn()
const listLogTagsActionMock = vi.fn()
const markLogReadActionMock = vi.fn()
const markLogUnreadActionMock = vi.fn()
const markAllLogsReadActionMock = vi.fn()

vi.mock('../actions', () => ({
  listLogsAction: (...args: unknown[]) => listLogsActionMock(...args),
  getLogStatsAction: (...args: unknown[]) => getLogStatsActionMock(...args),
  listLogTagsAction: (...args: unknown[]) => listLogTagsActionMock(...args),
  markLogReadAction: (...args: unknown[]) => markLogReadActionMock(...args),
  markLogUnreadAction: (...args: unknown[]) => markLogUnreadActionMock(...args),
  markAllLogsReadAction: (...args: unknown[]) =>
    markAllLogsReadActionMock(...args),
}))

const sampleRow = {
  id: 42,
  level: 'error' as const,
  tag: 'auth-session',
  message: 'Token refresh failed',
  context: { reason: 'expired_refresh_token' },
  createdAt: '2026-07-18T14:32:07.412Z',
  readAt: null,
  isUnread: true,
}

const makeRow = (
  id: number,
  createdAt: string,
  overrides: Partial<typeof sampleRow> = {},
) => ({
  ...sampleRow,
  id,
  createdAt,
  message: `Log ${id}`,
  ...overrides,
})

const defaultStats = {
  total: 1,
  debug: 0,
  info: 0,
  warn: 0,
  error: 1,
  unread: 1,
}

type ListLogsInput = {
  cursor?: { id: number; createdAt: string }
  sortDirection?: string
  perPage?: number
  filters?: unknown
}

const getListCalls = () =>
  listLogsActionMock.mock.calls.map((call) => call[0] as ListLogsInput)

describe('useAdminLogsTableState cursor stack', () => {
  let queryClient: QueryClient

  const renderTableStateHook = () =>
    renderHook(() => useAdminLogsTableState(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    refreshMock.mockReset()
    listLogsActionMock.mockReset()
    getLogStatsActionMock.mockReset()
    listLogTagsActionMock.mockReset()
    markLogReadActionMock.mockReset()
    markLogUnreadActionMock.mockReset()
    markAllLogsReadActionMock.mockReset()

    getLogStatsActionMock.mockResolvedValue({
      success: true,
      data: defaultStats,
    })
    listLogTagsActionMock.mockResolvedValue({
      success: true,
      data: [],
    })
    markLogReadActionMock.mockResolvedValue({
      success: true,
      data: { id: 42 },
    })
    markLogUnreadActionMock.mockResolvedValue({
      success: true,
      data: { id: 42 },
    })
    markAllLogsReadActionMock.mockResolvedValue({
      success: true,
      data: { markedCount: 0 },
    })
  })

  it('should advance to page 2 with the last row cursor', async () => {
    const pageOneCreatedAt = '2026-08-01T00:00:00.000A'
    listLogsActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [makeRow(10, pageOneCreatedAt)],
        hasNextPage: true,
        filteredUnreadCount: 0,
      },
    })

    const { result } = renderTableStateHook()

    await waitFor(() => {
      expect(result.current.rows.at(-1)?.id).toBe(10)
    })

    act(() => {
      result.current.handleNext()
    })

    await waitFor(() => {
      expect(result.current.page).toBe(2)
    })

    const callsWithCursor = getListCalls().filter((call) => call.cursor)
    expect(callsWithCursor.at(-1)?.cursor).toEqual({
      id: 10,
      createdAt: pageOneCreatedAt,
    })
  })

  it('should rewind to page 1 with an undefined cursor', async () => {
    const pageOneCreatedAt = '2026-08-01T00:00:00.000A'
    const pageTwoCreatedAt = '2026-08-02T00:00:00.000B'

    listLogsActionMock.mockImplementation(async (input: ListLogsInput) => {
      if (!input.cursor) {
        return {
          success: true,
          data: {
            rows: [makeRow(10, pageOneCreatedAt)],
            hasNextPage: true,
            filteredUnreadCount: 0,
          },
        }
      }

      return {
        success: true,
        data: {
          rows: [makeRow(20, pageTwoCreatedAt)],
          hasNextPage: false,
          filteredUnreadCount: 0,
        },
      }
    })

    const { result } = renderTableStateHook()

    await waitFor(() => {
      expect(result.current.rows.at(-1)?.id).toBe(10)
    })

    act(() => {
      result.current.handleNext()
    })

    await waitFor(() => {
      expect(result.current.page).toBe(2)
    })

    act(() => {
      result.current.handlePrevious()
    })

    await waitFor(() => {
      expect(result.current.page).toBe(1)
    })

    const callsAfterRewind = getListCalls()
    expect(callsAfterRewind.at(-1)?.cursor).toBeUndefined()
  })

  it('should truncate the stack when advancing after a rewind with changed page rows', async () => {
    const pageOneCreatedAt = '2026-08-01T00:00:00.000A'
    const pageTwoCreatedAt = '2026-08-02T00:00:00.000B'
    const pageThreeCreatedAt = '2026-08-03T00:00:00.000C'
    const pageTwoUpdatedCreatedAt = '2026-08-02T00:00:00.999Z'
    let pageTwoFetchCount = 0

    listLogsActionMock.mockImplementation(async (input: ListLogsInput) => {
      if (!input.cursor) {
        return {
          success: true,
          data: {
            rows: [makeRow(10, pageOneCreatedAt)],
            hasNextPage: true,
            filteredUnreadCount: 0,
          },
        }
      }

      if (input.cursor.id === 10) {
        pageTwoFetchCount += 1

        if (pageTwoFetchCount === 1) {
          return {
            success: true,
            data: {
              rows: [makeRow(20, pageTwoCreatedAt)],
              hasNextPage: true,
              filteredUnreadCount: 0,
            },
          }
        }

        return {
          success: true,
          data: {
            rows: [makeRow(25, pageTwoUpdatedCreatedAt)],
            hasNextPage: true,
            filteredUnreadCount: 0,
          },
        }
      }

      if (input.cursor.id === 20) {
        return {
          success: true,
          data: {
            rows: [makeRow(30, pageThreeCreatedAt)],
            hasNextPage: false,
            filteredUnreadCount: 0,
          },
        }
      }

      return {
        success: true,
        data: {
          rows: [],
          hasNextPage: false,
          filteredUnreadCount: 0,
        },
      }
    })

    const { result } = renderTableStateHook()

    await waitFor(() => {
      expect(result.current.rows.at(-1)?.id).toBe(10)
    })

    act(() => {
      result.current.handleNext()
    })

    await waitFor(() => {
      expect(result.current.page).toBe(2)
      expect(result.current.rows.at(-1)?.id).toBe(20)
    })

    act(() => {
      result.current.handleNext()
    })

    await waitFor(() => {
      expect(result.current.page).toBe(3)
    })

    act(() => {
      result.current.handlePrevious()
    })

    await waitFor(() => {
      expect(result.current.page).toBe(2)
    })

    await waitFor(() => {
      expect(result.current.rows.at(-1)?.id).toBe(25)
    })

    act(() => {
      result.current.handleNext()
    })

    await waitFor(() => {
      expect(result.current.page).toBe(3)
    })

    const callsWithCursor = getListCalls().filter((call) => call.cursor)
    expect(callsWithCursor.at(-1)?.cursor).toEqual({
      id: 25,
      createdAt: pageTwoUpdatedCreatedAt,
    })
  })

  it('should reset to page 1 when a filter toggles after advance', async () => {
    const pageOneCreatedAt = '2026-08-01T00:00:00.000A'

    listLogsActionMock.mockImplementation(async (input: ListLogsInput) => {
      if (!input.cursor) {
        return {
          success: true,
          data: {
            rows: [makeRow(10, pageOneCreatedAt)],
            hasNextPage: true,
            filteredUnreadCount: 0,
          },
        }
      }

      return {
        success: true,
        data: {
          rows: [makeRow(20, '2026-08-02T00:00:00.000B')],
          hasNextPage: false,
          filteredUnreadCount: 0,
        },
      }
    })

    const { result } = renderTableStateHook()

    await waitFor(() => {
      expect(result.current.rows.at(-1)?.id).toBe(10)
    })

    act(() => {
      result.current.handleNext()
    })

    await waitFor(() => {
      expect(result.current.page).toBe(2)
    })

    act(() => {
      result.current.handleLevelToggle('error')
    })

    await waitFor(() => {
      expect(result.current.page).toBe(1)
    })

    const callsAfterFilter = getListCalls()
    expect(callsAfterFilter.at(-1)?.cursor).toBeUndefined()
  })

  it('should not advance when the current page has no rows', async () => {
    listLogsActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [],
        hasNextPage: false,
        filteredUnreadCount: 0,
      },
    })

    const { result } = renderTableStateHook()

    await waitFor(() => {
      expect(listLogsActionMock).toHaveBeenCalled()
    })

    const callsBeforeNext = getListCalls().length

    act(() => {
      result.current.handleNext()
    })

    expect(result.current.page).toBe(1)
    expect(getListCalls().length).toBe(callsBeforeNext)
    expect(getListCalls().every((call) => !call.cursor)).toBe(true)
  })
})
