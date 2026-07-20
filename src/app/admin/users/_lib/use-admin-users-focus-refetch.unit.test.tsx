import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAdminUserStats } from './use-admin-user-stats'
import { useAdminUsersList } from './use-admin-users-list'

const listUsersActionMock = vi.fn()
const getUserStatsActionMock = vi.fn()

vi.mock('../actions', () => ({
  listUsersAction: (...args: unknown[]) => listUsersActionMock(...args),
  getUserStatsAction: (...args: unknown[]) => getUserStatsActionMock(...args),
}))

const defaultListParams = {
  page: 1,
  emailFilter: undefined,
  sortColumn: 'created_at' as const,
  sortDirection: 'desc' as const,
  perPage: 15 as const,
  filterUnverified: false,
  filterBanned: false,
}

describe('admin users focus refetch', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    listUsersActionMock.mockReset()
    getUserStatsActionMock.mockReset()

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
      data: { total: 1, unverified: 0, banned: 0 },
    })

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('refetches the users list when the window regains focus', async () => {
    renderHook(() => useAdminUsersList(defaultListParams), { wrapper })

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenCalledTimes(1)
    })

    focusManager.setFocused(false)
    focusManager.setFocused(true)

    await waitFor(() => {
      expect(listUsersActionMock).toHaveBeenCalledTimes(2)
    })
  })

  it('refetches user stats when the window regains focus', async () => {
    renderHook(() => useAdminUserStats(), { wrapper })

    await waitFor(() => {
      expect(getUserStatsActionMock).toHaveBeenCalledTimes(1)
    })

    focusManager.setFocused(false)
    focusManager.setFocused(true)

    await waitFor(() => {
      expect(getUserStatsActionMock).toHaveBeenCalledTimes(2)
    })
  })
})
