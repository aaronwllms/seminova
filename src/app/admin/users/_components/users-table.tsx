'use client'

import { AppErrorSurface } from '@/components/app-error-surface'
import { DataTableShell } from '@/components/data-table-shell'
import { DataTablePaginationControls } from '@/components/data-table-pagination-controls'
import { TableFetchDimWrapper } from '@/components/table-fetch-dim-wrapper'

import { useAdminUsersTableState } from '../_lib/use-admin-users-table-state'
import { hasActiveUserListFilters } from '../_lib/user-list-filters'
import { BanUserDialog } from './ban-user-dialog'
import { PromoteDemoteDialog } from './promote-demote-dialog'
import { UnbanUserDialog } from './unban-user-dialog'
import { UsersFilteredEmptyState } from './users-filtered-empty-state'
import { UsersStatTiles } from './users-stat-tiles'
import { UsersToolbar } from './users-toolbar'

interface UsersTableProps {
  currentAdminUserId: string
}

export const UsersTable = ({ currentAdminUserId }: UsersTableProps) => {
  const {
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
    pageSizeOptions,
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
  } = useAdminUsersTableState({ currentAdminUserId })

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
          filters={filters}
          onRemoveFilter={handleRemoveFilterChip}
          onClearAllFilters={handleResetFilters}
          onRefresh={() => {
            void refresh()
          }}
          isRefreshing={isRefreshing}
          isFetching={isFetching}
        />
      </div>

      {statsError ? <AppErrorSurface error={statsError} /> : null}
      {listError ? <AppErrorSurface error={listError} /> : null}

      <AppErrorSurface error={mutationAppError} />

      <TableFetchDimWrapper
        isFetching={isFetching}
        hasStaleRows={rows.length > 0}
      >
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
      </TableFetchDimWrapper>

      <DataTablePaginationControls
        page={page}
        hasNextPage={hasNextPage}
        isPending={isFetching}
        onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => current + 1)}
        pageSize={perPage}
        pageSizeOptions={pageSizeOptions}
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
