import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LogsTable } from './logs-table'

const refreshMock = vi.fn()
const useAdminLogsRealtimeMock = vi.fn()

vi.mock('../_lib/use-admin-logs-realtime', () => ({
  useAdminLogsRealtime: (options?: { enabled?: boolean }) =>
    useAdminLogsRealtimeMock(options),
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

const defaultFilters = {
  levels: [],
  unreadOnly: false,
  tag: null,
  search: null,
}

const defaultListParams = {
  cursor: undefined,
  sortDirection: 'desc',
  perPage: 15,
  filters: defaultFilters,
} as const

describe('LogsTable', () => {
  beforeEach(() => {
    refreshMock.mockReset()
    useAdminLogsRealtimeMock.mockReturnValue({
      refresh: refreshMock,
      isRefreshing: false,
    })

    listLogsActionMock.mockReset()
    getLogStatsActionMock.mockReset()
    listLogTagsActionMock.mockReset()
    markLogReadActionMock.mockReset()
    markLogUnreadActionMock.mockReset()
    markAllLogsReadActionMock.mockReset()

    listLogsActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [sampleRow],
        hasNextPage: false,
        filteredUnreadCount: 1,
      },
    })
    getLogStatsActionMock.mockResolvedValue({
      success: true,
      data: {
        total: 1,
        debug: 0,
        info: 0,
        warn: 0,
        error: 1,
        unread: 1,
      },
    })
    listLogTagsActionMock.mockResolvedValue({
      success: true,
      data: ['auth-session'],
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
      data: { markedCount: 1 },
    })
  })

  const renderTable = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <LogsTable />
      </QueryClientProvider>,
    )
  }

  const waitForStatTiles = async () => {
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^error, 1$/i }),
      ).toBeInTheDocument()
    })
  }

  const getErrorStatTile = () =>
    screen.getByRole('button', { name: /^error, 1$/i })

  it('should load logs on mount and render message column', async () => {
    renderTable()

    await waitFor(() => {
      expect(screen.getByText('Token refresh failed')).toBeInTheDocument()
    })

    expect(listLogsActionMock).toHaveBeenCalledWith(defaultListParams)
  })

  it('should open the detail dialog and mark an unread row read when clicked', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('Token refresh failed')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Token refresh failed'))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    await waitFor(() => {
      expect(markLogReadActionMock).toHaveBeenCalledWith({ id: 42 })
    })
  })

  it('should not mark a read row read when clicked', async () => {
    listLogsActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [
          { ...sampleRow, readAt: '2026-07-18T15:00:00.000Z', isUnread: false },
        ],
        hasNextPage: false,
        filteredUnreadCount: 0,
      },
    })

    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('Token refresh failed')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Token refresh failed'))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(markLogReadActionMock).not.toHaveBeenCalled()
  })

  it('should mark a row read when the unread indicator is clicked', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /mark log 42 as read/i }),
      ).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', { name: /mark log 42 as read/i }),
    )

    await waitFor(() => {
      expect(markLogReadActionMock).toHaveBeenCalledWith({ id: 42 })
    })
  })

  it('should reset paging and refetch when an error tile is toggled', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(listLogsActionMock).toHaveBeenCalledTimes(1)
    })

    await waitForStatTiles()

    await user.click(getErrorStatTile())

    await waitFor(() => {
      expect(listLogsActionMock).toHaveBeenLastCalledWith({
        cursor: undefined,
        sortDirection: 'desc',
        perPage: 15,
        filters: {
          ...defaultFilters,
          levels: ['error'],
        },
      })
    })
  })

  it('should pass the current filter snapshot to mark all as read', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /mark all as read/i }),
      ).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: /mark all as read/i }))

    await waitFor(() => {
      expect(markAllLogsReadActionMock).toHaveBeenCalledWith({
        filters: defaultFilters,
      })
    })
  })

  it('should copy an unread row and mark it read without opening the modal', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('Token refresh failed')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /copy log row 42/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^copied$/i }),
      ).toBeInTheDocument()
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(markLogReadActionMock).toHaveBeenCalledWith({ id: 42 })
  })

  it('should copy a read row without marking it read again', async () => {
    listLogsActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [
          {
            ...sampleRow,
            readAt: '2026-07-18T15:00:00.000Z',
            isUnread: false,
          },
        ],
        hasNextPage: false,
        filteredUnreadCount: 0,
      },
    })

    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('Token refresh failed')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /copy log row 42/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^copied$/i }),
      ).toBeInTheDocument()
    })
    expect(markLogReadActionMock).not.toHaveBeenCalled()
  })

  it('should show an error with copy affordance when listLogsAction fails', async () => {
    listLogsActionMock.mockResolvedValue({
      success: false,
      error: {
        message: 'Something went wrong loading logs. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })

    renderTable()

    await waitFor(() => {
      expect(
        screen.getByText(
          'Something went wrong loading logs. Please try again.',
        ),
      ).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument()
  })

  it('should reset to page 1 and refetch when timestamp sort toggles', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(listLogsActionMock).toHaveBeenCalledTimes(1)
    })

    await user.click(screen.getByRole('button', { name: /timestamp/i }))

    await waitFor(() => {
      expect(listLogsActionMock).toHaveBeenLastCalledWith({
        cursor: undefined,
        sortDirection: 'asc',
        perPage: 15,
        filters: defaultFilters,
      })
    })
  })

  it('should call refresh when the refresh button is clicked', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /refresh logs/i }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /refresh logs/i }))

    expect(refreshMock).toHaveBeenCalledTimes(1)
  })

  it('should render live toggle pressed by default and pass enabled to realtime hook', async () => {
    renderTable()

    await waitFor(() => {
      expect(useAdminLogsRealtimeMock).toHaveBeenCalledWith({ enabled: true })
    })

    expect(
      screen.getByRole('button', { name: /turn live feed off/i }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('should pass enabled=false to realtime hook when live toggle is turned off', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /turn live feed off/i }),
      ).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', { name: /turn live feed off/i }),
    )

    expect(useAdminLogsRealtimeMock).toHaveBeenLastCalledWith({
      enabled: false,
    })
    expect(
      screen.getByRole('button', { name: /turn live feed on/i }),
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show filtered empty state with reset and refresh actions', async () => {
    listLogsActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [],
        hasNextPage: false,
        filteredUnreadCount: 0,
      },
    })

    const user = userEvent.setup()

    renderTable()

    await waitForStatTiles()

    await user.click(getErrorStatTile())

    await waitFor(() => {
      expect(
        screen.getByText('No logs found for selected filters'),
      ).toBeInTheDocument()
    })

    expect(
      screen.getByRole('button', { name: /reset filters/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^refresh$/i }),
    ).toBeInTheDocument()
  })

  it('should reset filters from the filtered empty state', async () => {
    listLogsActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [],
        hasNextPage: false,
        filteredUnreadCount: 0,
      },
    })

    const user = userEvent.setup()

    renderTable()

    await waitForStatTiles()

    await user.click(getErrorStatTile())

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /reset filters/i }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /reset filters/i }))

    await waitFor(() => {
      expect(listLogsActionMock).toHaveBeenLastCalledWith(defaultListParams)
    })
  })

  it('should reset all filters when the Total tile is clicked', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('Token refresh failed')).toBeInTheDocument()
    })

    await user.type(
      screen.getByRole('searchbox', { name: /search logs/i }),
      'token',
    )
    await waitForStatTiles()

    await user.click(getErrorStatTile())

    await waitFor(() => {
      expect(listLogsActionMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            levels: ['error'],
            search: 'token',
          }),
        }),
      )
    })

    await user.click(screen.getByRole('button', { name: /total, 1/i }))

    await waitFor(() => {
      expect(listLogsActionMock).toHaveBeenLastCalledWith(defaultListParams)
    })

    expect(screen.getByRole('searchbox', { name: /search logs/i })).toHaveValue(
      '',
    )
  })

  it('should call refresh from the filtered empty state', async () => {
    listLogsActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [],
        hasNextPage: false,
        filteredUnreadCount: 0,
      },
    })

    const user = userEvent.setup()

    renderTable()

    await waitForStatTiles()

    await user.click(getErrorStatTile())

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^refresh$/i }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^refresh$/i }))

    expect(refreshMock).toHaveBeenCalledTimes(1)
  })

  it('should show plain empty copy when no filters are active', async () => {
    listLogsActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [],
        hasNextPage: false,
        filteredUnreadCount: 0,
      },
    })

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('No logs found.')).toBeInTheDocument()
    })

    expect(
      screen.queryByRole('button', { name: /reset filters/i }),
    ).not.toBeInTheDocument()
  })

  it('should disable the refresh button while manual refresh is in flight', async () => {
    useAdminLogsRealtimeMock.mockReturnValue({
      refresh: refreshMock,
      isRefreshing: true,
    })

    renderTable()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /refresh logs/i }),
      ).toBeDisabled()
    })
    expect(
      screen.getByRole('button', { name: /refresh logs/i }),
    ).toHaveAttribute('aria-busy', 'true')
  })

  it('should show active filter chips when filters are applied', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('Token refresh failed')).toBeInTheDocument()
    })

    await waitForStatTiles()

    await user.click(getErrorStatTile())
    await user.type(
      screen.getByRole('searchbox', { name: /search logs/i }),
      'token',
    )

    await waitFor(() => {
      expect(screen.getByText('Active filters:')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /remove error filter/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /remove search: token filter/i }),
      ).toBeInTheDocument()
    })
  })

  it('should remove a single active filter chip without clearing others', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('Token refresh failed')).toBeInTheDocument()
    })

    await waitForStatTiles()

    await user.click(getErrorStatTile())
    await user.type(
      screen.getByRole('searchbox', { name: /search logs/i }),
      'token',
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /remove search: token filter/i }),
      ).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', { name: /remove search: token filter/i }),
    )

    await waitFor(() => {
      expect(listLogsActionMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            levels: ['error'],
            search: null,
          }),
        }),
      )
    })
  })

  it('should clear all active filter chips from the chip row', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('Token refresh failed')).toBeInTheDocument()
    })

    await waitForStatTiles()

    await user.click(getErrorStatTile())

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^clear all$/i }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^clear all$/i }))

    await waitFor(() => {
      expect(listLogsActionMock).toHaveBeenLastCalledWith(defaultListParams)
    })
  })

  it('should disable mark all as read when there are no unread logs in view', async () => {
    listLogsActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [
          {
            ...sampleRow,
            readAt: '2026-07-18T15:00:00.000Z',
            isUnread: false,
          },
        ],
        hasNextPage: false,
        filteredUnreadCount: 0,
      },
    })

    renderTable()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /mark all as read/i }),
      ).toBeDisabled()
    })
  })
})
