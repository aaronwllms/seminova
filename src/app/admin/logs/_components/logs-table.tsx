'use client'

import { AppErrorSurface } from '@/components/app-error-surface'
import { DataTableShell } from '@/components/data-table-shell'
import { DataTablePaginationControls } from '@/components/data-table-pagination-controls'
import { TableFetchDimWrapper } from '@/components/table-fetch-dim-wrapper'
import { cn } from '@/utils/tailwind'

import { formatLogTimestampDisplay } from '../_lib/format-log-timestamp-display'
import { hasActiveLogListFilters } from '../_lib/log-list-filters'
import { useAdminLogsTableState } from '../_lib/use-admin-logs-table-state'
import { LogDetailDialog } from './log-detail-dialog'
import { LogsActiveFilters } from './logs-active-filters'
import { LogsFilteredEmptyState } from './logs-filtered-empty-state'
import { LogsStatTiles } from './logs-stat-tiles'
import { LogsToolbar } from './logs-toolbar'

export const LogsTable = () => {
  const {
    stats,
    isStatsLoading,
    statsError,
    filters,
    selectedLevels,
    unreadOnly,
    handleResetFilters,
    handleLevelToggle,
    handleUnreadToggle,
    searchInput,
    handleSearchInputChange,
    tags,
    tagsError,
    selectedTag,
    handleTagChange,
    liveEnabled,
    handleLiveEnabledChange,
    refresh,
    isRefreshing,
    handleMarkAllRead,
    filteredUnreadCount,
    markAllTooltip,
    isMarkAllPending,
    handleRemoveFilterChip,
    error,
    mutationAppError,
    table,
    columns,
    isLoading,
    isFetching,
    rows,
    showFilteredEmptyState,
    handleRowClick,
    page,
    hasNextPage,
    handlePrevious,
    handleNext,
    perPage,
    handlePageSizeChange,
    pageSizeOptions,
    selectedLog,
    detailOpen,
    setDetailOpen,
    handleMarkUnread,
    isMarkUnreadPending,
  } = useAdminLogsTableState()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <LogsStatTiles
          stats={stats}
          isFullyUnfiltered={!hasActiveLogListFilters(filters)}
          selectedLevels={selectedLevels}
          unreadOnly={unreadOnly}
          isLoading={isStatsLoading}
          onTotalClick={handleResetFilters}
          onLevelToggle={handleLevelToggle}
          onUnreadToggle={handleUnreadToggle}
        />

        {tagsError ? <AppErrorSurface error={tagsError} /> : null}

        <LogsToolbar
          searchInput={searchInput}
          onSearchInputChange={handleSearchInputChange}
          selectedTag={selectedTag}
          onTagChange={handleTagChange}
          tags={tags}
          tagsDisabled={tagsError !== null}
          liveEnabled={liveEnabled}
          onLiveEnabledChange={handleLiveEnabledChange}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          isFetching={isFetching}
          onMarkAllRead={handleMarkAllRead}
          markAllDisabled={filteredUnreadCount === 0}
          markAllTooltip={markAllTooltip}
          isMarkAllPending={isMarkAllPending}
        />

        <LogsActiveFilters
          filters={filters}
          onRemove={handleRemoveFilterChip}
          onClearAll={handleResetFilters}
        />
      </div>

      {statsError ? <AppErrorSurface error={statsError} /> : null}

      {error ? <AppErrorSurface error={error} /> : null}

      <AppErrorSurface error={mutationAppError} />

      <TableFetchDimWrapper
        isFetching={isFetching}
        hasStaleRows={rows.length > 0}
      >
        <DataTableShell
          table={table}
          columns={columns}
          isLoading={isLoading && rows.length === 0}
          loadingLabel="Loading logs…"
          emptyMessage="No logs found."
          emptyContent={
            showFilteredEmptyState ? (
              <LogsFilteredEmptyState
                onResetFilters={handleResetFilters}
                onRefresh={refresh}
                isRefreshing={isRefreshing}
              />
            ) : undefined
          }
          onRowClick={handleRowClick}
          getRowClassName={(row) =>
            row.isUnread ? cn('bg-primary/10 hover:bg-primary/15') : undefined
          }
          getRowAccessibilityLabel={(row) =>
            `${row.isUnread ? 'Unread log' : 'Read log'}: ${formatLogTimestampDisplay(row.createdAt)}, ${row.level}, ${row.tag}, ${row.message}`
          }
        />
      </TableFetchDimWrapper>

      <DataTablePaginationControls
        page={page}
        hasNextPage={hasNextPage}
        isPending={isFetching}
        onPrevious={handlePrevious}
        onNext={handleNext}
        pageSize={perPage}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={handlePageSizeChange}
      />

      <LogDetailDialog
        log={selectedLog}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onMarkUnread={handleMarkUnread}
        isMarkUnreadPending={isMarkUnreadPending}
      />
    </div>
  )
}
