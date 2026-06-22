import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UsersTable } from './users-table'

const listUsersActionMock = vi.fn()
const promoteUserActionMock = vi.fn()
const demoteUserActionMock = vi.fn()
const showSuccessToastMock = vi.fn()

vi.mock('../actions', () => ({
  listUsersAction: (...args: unknown[]) => listUsersActionMock(...args),
  promoteUserAction: (...args: unknown[]) => promoteUserActionMock(...args),
  demoteUserAction: (...args: unknown[]) => demoteUserActionMock(...args),
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: (...args: unknown[]) => showSuccessToastMock(...args),
}))

const CURRENT_ADMIN_ID = 'admin-user-id'

describe('UsersTable', () => {
  beforeEach(() => {
    listUsersActionMock.mockReset()
    promoteUserActionMock.mockReset()
    demoteUserActionMock.mockReset()
    showSuccessToastMock.mockReset()

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

  const renderTable = () =>
    render(<UsersTable currentAdminUserId={CURRENT_ADMIN_ID} />)

  it('should load users on mount and render email column', async () => {
    renderTable()

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    expect(listUsersActionMock).toHaveBeenCalledWith({
      page: 1,
      emailFilter: undefined,
    })
  })

  it('should disable Next when hasNextPage is false', async () => {
    renderTable()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
    })
  })

  it('should debounce search and call action with email filter', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    })

    renderTable()

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

  it('should show an error with copy affordance when listUsersAction fails', async () => {
    listUsersActionMock.mockResolvedValue({
      success: false,
      error: {
        message: 'Something went wrong loading users. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })

    renderTable()

    expect(
      await screen.findByText(
        'Something went wrong loading users. Please try again.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /copy error details/i }),
    ).toBeInTheDocument()
  })

  it('should show skeleton rows while loading with an empty table body', () => {
    listUsersActionMock.mockImplementation(() => new Promise(() => {}))

    const { container } = renderTable()

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
    expect(screen.queryByText('No users found.')).not.toBeInTheDocument()
    expect(screen.getByText('Loading users…')).toHaveClass('sr-only')
  })

  it('should not show demote for the current admin row', async () => {
    listUsersActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [
          {
            id: CURRENT_ADMIN_ID,
            email: 'me@example.com',
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

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('me@example.com')).toBeInTheDocument()
    })

    expect(
      screen.queryByRole('button', { name: /actions for me@example.com/i }),
    ).not.toBeInTheDocument()
  })

  it('should promote a user after confirmation and show success toast', async () => {
    const user = userEvent.setup()

    listUsersActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [
          {
            id: 'user-2',
            email: 'bob@example.com',
            isVerified: true,
            createdAtLabel: 'Jun 1, 2024',
            lastSignInAtLabel: 'Jun 2, 2024',
            isAdmin: false,
          },
        ],
        hasNextPage: false,
        page: 1,
      },
    })

    promoteUserActionMock.mockResolvedValue({
      success: true,
      data: { status: 'promoted', email: 'bob@example.com' },
    })

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', { name: /actions for bob@example.com/i }),
    )
    await user.click(
      screen.getByRole('menuitem', { name: /promote to admin/i }),
    )
    await user.click(screen.getByRole('button', { name: /^promote$/i }))

    await waitFor(() => {
      expect(promoteUserActionMock).toHaveBeenCalledWith({ userId: 'user-2' })
    })

    expect(showSuccessToastMock).toHaveBeenCalledWith('User promoted to admin')
    expect(listUsersActionMock.mock.calls.length).toBeGreaterThan(1)
  })
})
