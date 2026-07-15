import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UsersTable } from './users-table'

const listUsersActionMock = vi.fn()
const promoteUserActionMock = vi.fn()
const demoteUserActionMock = vi.fn()
const banUserActionMock = vi.fn()
const unbanUserActionMock = vi.fn()
const showSuccessToastMock = vi.fn()

vi.mock('../actions', () => ({
  listUsersAction: (...args: unknown[]) => listUsersActionMock(...args),
  promoteUserAction: (...args: unknown[]) => promoteUserActionMock(...args),
  demoteUserAction: (...args: unknown[]) => demoteUserActionMock(...args),
  banUserAction: (...args: unknown[]) => banUserActionMock(...args),
  unbanUserAction: (...args: unknown[]) => unbanUserActionMock(...args),
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: (...args: unknown[]) => showSuccessToastMock(...args),
}))

const CURRENT_ADMIN_ID = 'admin-user-id'

const defaultListParams = {
  page: 1,
  emailFilter: undefined,
  sortColumn: 'created_at',
  sortDirection: 'desc',
  perPage: 15,
  showBanned: true,
} as const

describe('UsersTable', () => {
  beforeEach(() => {
    listUsersActionMock.mockReset()
    promoteUserActionMock.mockReset()
    demoteUserActionMock.mockReset()
    banUserActionMock.mockReset()
    unbanUserActionMock.mockReset()
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
            banStatus: null,
          },
        ],
        hasNextPage: false,
        page: 1,
      },
    })
  })

  const renderTable = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <UsersTable currentAdminUserId={CURRENT_ADMIN_ID} />
      </QueryClientProvider>,
    )
  }

  it('should load users on mount and render email column', async () => {
    renderTable()

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    expect(listUsersActionMock).toHaveBeenCalledWith(defaultListParams)
  })

  it('should disable Next when hasNextPage is false', async () => {
    renderTable()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
    })
  })

  it('should debounce search and call action with email filter', async () => {
    const user = userEvent.setup({ delay: null })

    renderTable()

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenCalledTimes(1)
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/search by email/i), 'abc')

    await waitFor(
      () => {
        expect(listUsersActionMock).toHaveBeenLastCalledWith({
          ...defaultListParams,
          emailFilter: 'abc',
        })
      },
      { timeout: 1000 },
    )
  })

  it('should reset page and refetch when Show banned is unchecked', async () => {
    const user = userEvent.setup({ delay: null })

    renderTable()

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenCalledWith(defaultListParams)
    })

    await user.click(screen.getByRole('checkbox', { name: /show banned/i }))

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenLastCalledWith({
        ...defaultListParams,
        showBanned: false,
      })
    })
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

    await waitFor(() => {
      expect(
        screen.getByText(
          'Something went wrong loading users. Please try again.',
        ),
      ).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument()
  })

  it('should show skeleton rows while loading with an empty table body', () => {
    listUsersActionMock.mockImplementation(() => new Promise(() => {}))

    const { container } = renderTable()

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
    expect(screen.queryByText('No users found.')).not.toBeInTheDocument()
    expect(screen.getByText('Loading users…')).toHaveClass('sr-only')
  })

  it('should not show actions for the current admin row', async () => {
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
            banStatus: null,
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
    const user = userEvent.setup({ delay: null })

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
            banStatus: null,
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
    await waitFor(() => {
      expect(listUsersActionMock.mock.calls.length).toBeGreaterThan(1)
    })
  })

  it('should ban a user after confirmation and show success toast', async () => {
    const user = userEvent.setup({ delay: null })

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
            banStatus: null,
          },
        ],
        hasNextPage: false,
        page: 1,
      },
    })

    banUserActionMock.mockResolvedValue({
      success: true,
      data: { status: 'banned', email: 'bob@example.com' },
    })

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', { name: /actions for bob@example.com/i }),
    )
    await user.click(screen.getByRole('menuitem', { name: /ban user/i }))
    await user.click(screen.getByRole('button', { name: /^ban user$/i }))

    await waitFor(() => {
      expect(banUserActionMock).toHaveBeenCalledWith({
        userId: 'user-2',
        banDuration: '24h',
      })
    })

    expect(showSuccessToastMock).toHaveBeenCalledWith('User banned')
  })

  it('should unban a banned user after confirmation', async () => {
    const user = userEvent.setup({ delay: null })
    const until = new Date('2026-01-01T00:00:00.000Z')

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
            banStatus: { until },
          },
        ],
        hasNextPage: false,
        page: 1,
      },
    })

    unbanUserActionMock.mockResolvedValue({
      success: true,
      data: { status: 'unbanned', email: 'bob@example.com' },
    })

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', { name: /actions for bob@example.com/i }),
    )
    await user.click(screen.getByRole('menuitem', { name: /^unban$/i }))
    await user.click(screen.getByRole('button', { name: /^unban$/i }))

    await waitFor(() => {
      expect(unbanUserActionMock).toHaveBeenCalledWith({ userId: 'user-2' })
    })

    expect(showSuccessToastMock).toHaveBeenCalledWith('User unbanned')
  })

  it('should show mutation faults in a reportable panel without replacing table rows', async () => {
    const user = userEvent.setup({ delay: null })

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
            banStatus: null,
          },
        ],
        hasNextPage: false,
        page: 1,
      },
    })

    promoteUserActionMock.mockResolvedValue({
      success: false,
      error: {
        message: 'Something went wrong updating the user. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
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

    expect(
      await screen.findByText(
        'Something went wrong updating the user. Please try again.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })
})
