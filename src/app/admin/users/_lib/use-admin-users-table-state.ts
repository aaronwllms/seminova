'use client'

import type { SortingState } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'

import { useDataTableShell } from '@/components/data-table-shell'
import type { AdminBanDuration } from '@/constants/admin-ban'
import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
  type DataTablePageSize,
} from '@/constants/data-table'
import { useToggleFilterSet } from '@/hooks/use-toggle-filter-set'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { toAppError } from '@/utils/is-app-error'

import {
  USERS_SEARCH_MIN_LENGTH,
  type AdminUserRow,
  type UsersSortColumn,
  type UsersSortDirection,
} from './admin-user-row'
import {
  hasActiveUserListFilters,
  type UserListFilters,
} from './user-list-filters'
import { useAdminUserBanMutation } from './use-admin-user-ban-mutation'
import { useAdminUserRoleMutation } from './use-admin-user-role-mutation'
import { useAdminUserStats } from './use-admin-user-stats'
import { useAdminUsersList } from './use-admin-users-list'
import { useAdminUsersRefresh } from './use-admin-users-refresh'
import { createUsersColumns } from '../_components/users-columns'
import type { RoleConfirmAction } from '../_components/promote-demote-dialog'
import type { UserMutationConfirmAction } from '../_components/user-mutation-confirm-action'

const COLUMN_ID_TO_SORT_KEY: Record<string, UsersSortColumn> = {
  email: 'email',
  isVerified: 'email_confirmed_at',
  createdAtLabel: 'created_at',
  lastSignInAtLabel: 'last_sign_in_at',
  isAdmin: 'role',
  banStatus: 'banned_until',
}

const DEFAULT_SORTING: SortingState = [{ id: 'createdAtLabel', desc: true }]

interface UseAdminUsersTableStateOptions {
  currentAdminUserId: string
}

export const useAdminUsersTableState = ({
  currentAdminUserId,
}: UseAdminUsersTableStateOptions) => {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<DataTablePageSize>(
    DATA_TABLE_DEFAULT_PAGE_SIZE,
  )
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [trackedDebouncedSearch, setTrackedDebouncedSearch] =
    useState(debouncedSearch)
  const {
    toggle: toggleFilter,
    clearAll: clearFilters,
    isActive: isFilterActive,
  } = useToggleFilterSet<'unverified' | 'banned' | 'new30d'>()
  const filterUnverified = isFilterActive('unverified')
  const filterBanned = isFilterActive('banned')
  const filterNew30d = isFilterActive('new30d')
  const [confirmAction, setConfirmAction] = useState<RoleConfirmAction | null>(
    null,
  )
  const [banConfirmAction, setBanConfirmAction] =
    useState<UserMutationConfirmAction | null>(null)
  const [unbanConfirmAction, setUnbanConfirmAction] =
    useState<UserMutationConfirmAction | null>(null)

  const activeSort = sorting[0]
  const sortColumn: UsersSortColumn = activeSort
    ? (COLUMN_ID_TO_SORT_KEY[activeSort.id] ?? 'created_at')
    : 'created_at'
  const sortDirection: UsersSortDirection = activeSort?.desc ? 'desc' : 'asc'

  const appliedSearch =
    debouncedSearch.trim().length >= USERS_SEARCH_MIN_LENGTH
      ? debouncedSearch.trim()
      : null

  const filters: UserListFilters = useMemo(
    () => ({
      filterUnverified,
      filterBanned,
      filterNew30d,
      search: appliedSearch,
    }),
    [appliedSearch, filterBanned, filterNew30d, filterUnverified],
  )

  if (trackedDebouncedSearch !== debouncedSearch) {
    setTrackedDebouncedSearch(debouncedSearch)
    setPage(1)
  }

  const { refresh, isRefreshing } = useAdminUsersRefresh()
  const {
    stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useAdminUserStats()
  const {
    rows,
    hasNextPage,
    isLoading,
    isFetching,
    error: listError,
  } = useAdminUsersList({
    page,
    emailFilter: debouncedSearch.trim() || undefined,
    sortColumn,
    sortDirection,
    perPage,
    filterUnverified,
    filterBanned,
    filterNew30d,
  })

  const {
    mutate: mutateRole,
    isPending: isRoleMutationPending,
    error: roleMutationError,
    variables: roleMutationVariables,
    reset: resetRoleMutation,
  } = useAdminUserRoleMutation()

  const {
    mutate: mutateBan,
    isPending: isBanMutationPending,
    error: banMutationError,
    variables: banMutationVariables,
    reset: resetBanMutation,
  } = useAdminUserBanMutation()

  const mutationError = roleMutationError ?? banMutationError
  const mutationAppError = mutationError ? toAppError(mutationError) : null

  const handleSortingChange = useCallback((next: SortingState) => {
    setSorting(next)
    setPage(1)
  }, [])

  const handlePageSizeChange = useCallback((nextPageSize: number) => {
    setPerPage(nextPageSize as DataTablePageSize)
    setPage(1)
  }, [])

  const handleResetFilters = useCallback(() => {
    clearFilters()
    setSearchInput('')
    setPage(1)
  }, [clearFilters])

  const handleRemoveFilterChip = useCallback(
    (id: string) => {
      switch (id) {
        case 'unverified':
          if (filterUnverified) {
            toggleFilter('unverified')
            setPage(1)
          }
          break
        case 'banned':
          if (filterBanned) {
            toggleFilter('banned')
            setPage(1)
          }
          break
        case 'new30d':
          if (filterNew30d) {
            toggleFilter('new30d')
            setPage(1)
          }
          break
        case 'search':
          setSearchInput('')
          setPage(1)
          break
      }
    },
    [filterBanned, filterNew30d, filterUnverified, toggleFilter],
  )

  const handleUnverifiedToggle = useCallback(() => {
    toggleFilter('unverified')
    setPage(1)
  }, [toggleFilter])

  const handleBannedToggle = useCallback(() => {
    toggleFilter('banned')
    setPage(1)
  }, [toggleFilter])

  const handleNew30dToggle = useCallback(() => {
    toggleFilter('new30d')
    setPage(1)
  }, [toggleFilter])

  const resetMutations = useCallback(() => {
    resetRoleMutation()
    resetBanMutation()
  }, [resetBanMutation, resetRoleMutation])

  const handlePromote = useCallback(
    (row: AdminUserRow) => {
      resetMutations()
      setBanConfirmAction(null)
      setUnbanConfirmAction(null)
      setConfirmAction({ type: 'promote', userId: row.id, email: row.email })
    },
    [resetMutations],
  )

  const handleDemote = useCallback(
    (row: AdminUserRow) => {
      resetMutations()
      setBanConfirmAction(null)
      setUnbanConfirmAction(null)
      setConfirmAction({ type: 'demote', userId: row.id, email: row.email })
    },
    [resetMutations],
  )

  const handleBan = useCallback(
    (row: AdminUserRow) => {
      resetMutations()
      setConfirmAction(null)
      setUnbanConfirmAction(null)
      setBanConfirmAction({ userId: row.id, email: row.email })
    },
    [resetMutations],
  )

  const handleUnban = useCallback(
    (row: AdminUserRow) => {
      resetMutations()
      setConfirmAction(null)
      setBanConfirmAction(null)
      setUnbanConfirmAction({ userId: row.id, email: row.email })
    },
    [resetMutations],
  )

  const pendingUserId =
    (isRoleMutationPending ? (roleMutationVariables?.userId ?? null) : null) ??
    (isBanMutationPending ? (banMutationVariables?.userId ?? null) : null)

  const columns = useMemo(
    () =>
      createUsersColumns({
        currentAdminUserId,
        pendingUserId,
        onPromote: handlePromote,
        onDemote: handleDemote,
        onBan: handleBan,
        onUnban: handleUnban,
      }),
    [
      currentAdminUserId,
      handleBan,
      handleDemote,
      handlePromote,
      handleUnban,
      pendingUserId,
    ],
  )

  const { table } = useDataTableShell({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    manualSorting: true,
    sorting,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      handleSortingChange(next)
    },
  })

  const handleConfirmRoleMutation = () => {
    if (!confirmAction) {
      return
    }

    const { type, userId } = confirmAction

    mutateRole(
      { type, userId },
      {
        onSettled: () => {
          setConfirmAction(null)
        },
      },
    )
  }

  const handleConfirmBan = (banDuration: AdminBanDuration) => {
    if (!banConfirmAction) {
      return
    }

    mutateBan(
      {
        type: 'ban',
        userId: banConfirmAction.userId,
        banDuration,
      },
      {
        onSettled: () => {
          setBanConfirmAction(null)
        },
      },
    )
  }

  const handleConfirmUnban = () => {
    if (!unbanConfirmAction) {
      return
    }

    mutateBan(
      { type: 'unban', userId: unbanConfirmAction.userId },
      {
        onSettled: () => {
          setUnbanConfirmAction(null)
        },
      },
    )
  }

  const showFilteredEmptyState =
    !isLoading && rows.length === 0 && hasActiveUserListFilters(filters)

  return {
    stats,
    isStatsLoading,
    statsError,
    filters,
    filterUnverified,
    filterBanned,
    filterNew30d,
    handleResetFilters,
    handleUnverifiedToggle,
    handleBannedToggle,
    handleNew30dToggle,
    searchInput,
    setSearchInput,
    refresh,
    isRefreshing,
    handleRemoveFilterChip,
    listError,
    mutationAppError,
    table,
    columns,
    isLoading,
    isFetching,
    rows,
    showFilteredEmptyState,
    page,
    setPage,
    hasNextPage,
    perPage,
    handlePageSizeChange,
    pageSizeOptions: DATA_TABLE_PAGE_SIZE_OPTIONS,
    confirmAction,
    setConfirmAction,
    banConfirmAction,
    setBanConfirmAction,
    unbanConfirmAction,
    setUnbanConfirmAction,
    pendingUserId,
    handleConfirmRoleMutation,
    handleConfirmBan,
    handleConfirmUnban,
  }
}
