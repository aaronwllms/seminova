'use client'

import type { SortingState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { AppErrorSurface } from '@/components/app-error-surface'
import {
  useDataTableShell,
  DataTableShell,
} from '@/components/data-table-shell'
import { DataTablePaginationControls } from '@/components/data-table-pagination-controls'
import type { AdminBanDuration } from '@/constants/admin-ban'
import { useToggleFilterSet } from '@/hooks/use-toggle-filter-set'
import type { AppError } from '@/types/app-error'

import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
  type DataTablePageSize,
} from '@/constants/data-table'

import {
  USERS_SEARCH_MIN_LENGTH,
  type AdminUserRow,
  type UsersSortColumn,
  type UsersSortDirection,
} from '../_lib/admin-user-row'
import {
  hasActiveUserListFilters,
  type UserListFilters,
} from '../_lib/user-list-filters'
import { useAdminUserBanMutation } from '../_lib/use-admin-user-ban-mutation'
import { useAdminUserRoleMutation } from '../_lib/use-admin-user-role-mutation'
import { useAdminUserStats } from '../_lib/use-admin-user-stats'
import { useAdminUsersList } from '../_lib/use-admin-users-list'
import { useAdminUsersRefresh } from '../_lib/use-admin-users-refresh'
import { BanUserDialog } from './ban-user-dialog'
import {
  PromoteDemoteDialog,
  type RoleConfirmAction,
} from './promote-demote-dialog'
import type { UserMutationConfirmAction } from './user-mutation-confirm-action'
import { UnbanUserDialog } from './unban-user-dialog'
import { UsersActiveFilters } from './users-active-filters'
import { UsersFilteredEmptyState } from './users-filtered-empty-state'
import { UsersStatTiles } from './users-stat-tiles'
import { UsersToolbar } from './users-toolbar'
import { createUsersColumns } from './users-columns'

const SEARCH_DEBOUNCE_MS = 300

const COLUMN_ID_TO_SORT_KEY: Record<string, UsersSortColumn> = {
  email: 'email',
  isVerified: 'email_confirmed_at',
  createdAtLabel: 'created_at',
  lastSignInAtLabel: 'last_sign_in_at',
  isAdmin: 'role',
  banStatus: 'banned_until',
}

const DEFAULT_SORTING: SortingState = [{ id: 'createdAtLabel', desc: true }]

interface UsersTableProps {
  currentAdminUserId: string
}

export const UsersTable = ({ currentAdminUserId }: UsersTableProps) => {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<DataTablePageSize>(
    DATA_TABLE_DEFAULT_PAGE_SIZE,
  )
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
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
    emailFilter: debouncedSearch || undefined,
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
  const mutationAppError = mutationError
    ? (mutationError as unknown as AppError)
    : null

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchInput])

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
    setDebouncedSearch('')
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
          setDebouncedSearch('')
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <UsersStatTiles
          stats={stats}
          isFullyUnfiltered={!hasActiveUserListFilters(filters)}
          filterUnverified={filterUnverified}
          filterBanned={filterBanned}
          filterNew30d={filterNew30d}
          isLoading={isStatsLoading}
          onTotalClick={handleResetFilters}
          onUnverifiedToggle={handleUnverifiedToggle}
          onBannedToggle={handleBannedToggle}
          onNew30dToggle={handleNew30dToggle}
        />

        <UsersToolbar
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onRefresh={() => {
            void refresh()
          }}
          isRefreshing={isRefreshing}
        />

        <UsersActiveFilters
          filters={filters}
          onRemove={handleRemoveFilterChip}
          onClearAll={handleResetFilters}
        />
      </div>

      {statsError ? <AppErrorSurface error={statsError} /> : null}
      {listError ? <AppErrorSurface error={listError} /> : null}

      <AppErrorSurface error={mutationAppError} />

      <div aria-busy={isFetching}>
        <DataTableShell
          table={table}
          columns={columns}
          isLoading={isLoading && rows.length === 0}
          loadingLabel="Loading users…"
          emptyMessage="No users found."
          emptyContent={
            showFilteredEmptyState ? (
              <UsersFilteredEmptyState
                onResetFilters={handleResetFilters}
                onRefresh={() => {
                  void refresh()
                }}
                isRefreshing={isRefreshing}
              />
            ) : undefined
          }
        />
      </div>

      <DataTablePaginationControls
        page={page}
        hasNextPage={hasNextPage}
        isPending={isFetching}
        onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => current + 1)}
        pageSize={perPage}
        pageSizeOptions={DATA_TABLE_PAGE_SIZE_OPTIONS}
        onPageSizeChange={handlePageSizeChange}
      />

      <PromoteDemoteDialog
        confirmAction={confirmAction}
        isPending={pendingUserId !== null}
        onOpenChange={(open) => {
          if (!open && pendingUserId === null) {
            setConfirmAction(null)
          }
        }}
        onConfirm={handleConfirmRoleMutation}
      />

      <BanUserDialog
        confirmAction={banConfirmAction}
        isPending={pendingUserId !== null}
        onOpenChange={(open) => {
          if (!open && pendingUserId === null) {
            setBanConfirmAction(null)
          }
        }}
        onConfirm={handleConfirmBan}
      />

      <UnbanUserDialog
        confirmAction={unbanConfirmAction}
        isPending={pendingUserId !== null}
        onOpenChange={(open) => {
          if (!open && pendingUserId === null) {
            setUnbanConfirmAction(null)
          }
        }}
        onConfirm={handleConfirmUnban}
      />
    </div>
  )
}
