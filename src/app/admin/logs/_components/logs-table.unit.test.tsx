import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LogsTable } from './logs-table'

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
  timestampLabel: 'Jul 18, 2026, 2:32:07 PM.412',
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

    await user.click(screen.getByRole('button', { name: /error/i }))

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
})
