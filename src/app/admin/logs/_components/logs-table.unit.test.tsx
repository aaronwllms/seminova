import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LogsTable } from './logs-table'

const listLogsActionMock = vi.fn()

vi.mock('../actions', () => ({
  listLogsAction: (...args: unknown[]) => listLogsActionMock(...args),
}))

const sampleRow = {
  id: 42,
  level: 'error' as const,
  tag: 'auth-session',
  message: 'Token refresh failed',
  context: { reason: 'expired_refresh_token' },
  createdAt: '2026-07-18T14:32:07.412Z',
  timestampLabel: 'Jul 18, 2026, 2:32:07 PM.412',
}

const defaultListParams = {
  cursor: undefined,
  sortDirection: 'desc',
  perPage: 15,
} as const

describe('LogsTable', () => {
  beforeEach(() => {
    listLogsActionMock.mockReset()

    listLogsActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [sampleRow],
        hasNextPage: false,
      },
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

  it('should open the detail dialog when a row is clicked', async () => {
    const user = userEvent.setup()

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('Token refresh failed')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Token refresh failed'))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getAllByText('Token refresh failed').length).toBeGreaterThan(
      1,
    )
    expect(screen.getByText(/expired_refresh_token/)).toBeInTheDocument()
  })

  it('should copy row JSON without opening the modal', async () => {
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
      })
    })
  })
})
