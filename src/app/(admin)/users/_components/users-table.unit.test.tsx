import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UsersTable } from './users-table'

const listUsersActionMock = vi.fn()

vi.mock('../actions', () => ({
  listUsersAction: (...args: unknown[]) => listUsersActionMock(...args),
}))

describe('UsersTable', () => {
  beforeEach(() => {
    listUsersActionMock.mockReset()
    listUsersActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [
          {
            id: 'user-1',
            email: 'admin@example.com',
            isVerified: true,
            createdAtLabel: 'Jun 1, 2024',
            lastSignInAtLabel: 'Jun 2, 2024',
            isAdmin: true,
          },
        ],
        hasNextPage: false,
        page: 1,
      },
    })
  })

  it('should load users on mount and render email column', async () => {
    render(<UsersTable />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    expect(listUsersActionMock).toHaveBeenCalledWith({
      page: 1,
      emailFilter: undefined,
    })
  })

  it('should disable Next when hasNextPage is false', async () => {
    render(<UsersTable />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
    })
  })

  it('should debounce search and call action with email filter', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    })

    render(<UsersTable />)

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenCalledTimes(1)
    })

    await user.type(screen.getByLabelText(/search by email/i), 'abc')

    await vi.advanceTimersByTimeAsync(300)

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenCalledWith({
        page: 1,
        emailFilter: 'abc',
      })
    })

    vi.useRealTimers()
  })
})
