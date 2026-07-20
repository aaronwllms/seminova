import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UsersTable } from './users-table'

const listUsersActionMock = vi.fn()
const getUserStatsActionMock = vi.fn()
const promoteUserActionMock = vi.fn()
const demoteUserActionMock = vi.fn()
const banUserActionMock = vi.fn()
const unbanUserActionMock = vi.fn()
const showSuccessToastMock = vi.fn()

vi.mock('../actions', () => ({
  listUsersAction: (...args: unknown[]) => listUsersActionMock(...args),
  getUserStatsAction: (...args: unknown[]) => getUserStatsActionMock(...args),
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
  filterUnverified: false,
  filterBanned: false,
  filterNew30d: false,
} as const

describe('UsersTable', () => {
  beforeEach(() => {
    listUsersActionMock.mockReset()
    getUserStatsActionMock.mockReset()
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
    getUserStatsActionMock.mockResolvedValue({
      success: true,
      data: { total: 1, unverified: 0, banned: 0, new30d: 0 },
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

  const waitForStatTiles = async () => {
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /total/i })).toBeInTheDocument()
    })
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

    await user.type(
      screen.getByRole('searchbox', { name: /search users by email/i }),
      'abc',
    )

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

  it('should reset page and refetch when Banned tile is toggled', async () => {
    const user = userEvent.setup({ delay: null })

    renderTable()

    await waitForStatTiles()

    await user.click(screen.getByRole('button', { name: /banned/i }))

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenLastCalledWith({
        ...defaultListParams,
        filterBanned: true,
      })
    })
  })

  it('should not render the Show banned checkbox', async () => {
    renderTable()

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    expect(
      screen.queryByRole('checkbox', { name: /show banned/i }),
    ).not.toBeInTheDocument()
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

  it('should show filtered empty state with reset and refresh actions', async () => {
    listUsersActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [],
        hasNextPage: false,
        page: 1,
      },
    })

    const user = userEvent.setup({ delay: null })

    renderTable()

    await waitForStatTiles()

    await user.click(screen.getByRole('button', { name: /banned/i }))

    await waitFor(() => {
      expect(
        screen.getByText('No users found for selected filters'),
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
    listUsersActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [],
        hasNextPage: false,
        page: 1,
      },
    })

    const user = userEvent.setup({ delay: null })

    renderTable()

    await waitForStatTiles()

    await user.click(screen.getByRole('button', { name: /banned/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /reset filters/i }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /reset filters/i }))

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenLastCalledWith(defaultListParams)
    })
  })

  it('should reset all filters when the Total tile is clicked', async () => {
    const user = userEvent.setup({ delay: null })

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    await waitForStatTiles()

    await user.type(
      screen.getByRole('searchbox', { name: /search users by email/i }),
      'admin',
    )
    await user.click(screen.getByRole('button', { name: /banned/i }))

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          emailFilter: 'admin',
          filterBanned: true,
        }),
      )
    })

    await user.click(screen.getByRole('button', { name: /total, 1/i }))

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenLastCalledWith(defaultListParams)
    })

    expect(
      screen.getByRole('searchbox', { name: /search users by email/i }),
    ).toHaveValue('')
  })

  it('should refetch list and stats when refresh is clicked', async () => {
    const user = userEvent.setup({ delay: null })

    renderTable()

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenCalledTimes(1)
      expect(getUserStatsActionMock).toHaveBeenCalledTimes(1)
    })

    await user.click(screen.getByRole('button', { name: /refresh users/i }))

    await waitFor(() => {
      expect(listUsersActionMock.mock.calls.length).toBeGreaterThan(1)
      expect(getUserStatsActionMock.mock.calls.length).toBeGreaterThan(1)
    })
  })

  it('should show active filter chips when filters are applied', async () => {
    const user = userEvent.setup({ delay: null })

    renderTable()

    await waitForStatTiles()

    await user.click(screen.getByRole('button', { name: /new \(30d\)/i }))

    await waitFor(() => {
      expect(screen.getByText('Active filters:')).toBeInTheDocument()
      expect(
        screen.getByText('New (30d)', { selector: '[data-slot="badge"]' }),
      ).toBeInTheDocument()
    })
  })

  it('should remove a single active filter chip without clearing others', async () => {
    const user = userEvent.setup({ delay: null })

    renderTable()

    await waitForStatTiles()

    await user.click(screen.getByRole('button', { name: /banned/i }))
    await user.click(screen.getByRole('button', { name: /new \(30d\)/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /remove banned filter/i }),
      ).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', { name: /remove banned filter/i }),
    )

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filterBanned: false,
          filterNew30d: true,
        }),
      )
    })
  })

  it('should clear all active filter chips from the chip row', async () => {
    const user = userEvent.setup({ delay: null })

    renderTable()

    await waitForStatTiles()

    await user.click(screen.getByRole('button', { name: /banned/i }))
    await user.type(
      screen.getByRole('searchbox', { name: /search users by email/i }),
      'admin',
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^clear all$/i }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^clear all$/i }))

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenLastCalledWith(defaultListParams)
    })
  })

  it('should pass new30d filter to listUsersAction', async () => {
    const user = userEvent.setup({ delay: null })

    renderTable()

    await waitForStatTiles()

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenCalledWith(defaultListParams)
    })

    await user.click(screen.getByRole('button', { name: /new \(30d\)/i }))

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenLastCalledWith({
        ...defaultListParams,
        filterNew30d: true,
      })
    })
  })

  it('should render Member badge for non-admin users', async () => {
    listUsersActionMock.mockResolvedValue({
      success: true,
      data: {
        rows: [
          {
            id: 'user-2',
            email: 'member@example.com',
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

    renderTable()

    await waitFor(() => {
      expect(screen.getByText('Member')).toBeInTheDocument()
    })
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
