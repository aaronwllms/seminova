'use client'

import type { SortingState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { AppErrorSurface } from '@/components/app-error-surface'
import {
  DataTableShell,
  useDataTableShell,
} from '@/components/data-table-shell'
import { DataTablePaginationControls } from '@/components/data-table-pagination-controls'
import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
  type DataTablePageSize,
} from '@/constants/data-table'
import { useToggleFilterSet } from '@/hooks/use-toggle-filter-set'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { LogLevel } from '@/types/app-settings'
import { toAppError } from '@/utils/is-app-error'
import { cn } from '@/utils/tailwind'

import type {
  AppLogCursor,
  AppLogRow,
  LogsSortDirection,
} from '../_lib/app-log-row'
import { isLogLevel } from '../_lib/app-log-row'
import { formatLogTimestampDisplay } from '../_lib/format-log-timestamp-display'
import {
  type LogListFilters,
  buildMarkAllLogsReadTooltip,
  hasActiveLogListFilters,
} from '../_lib/log-list-filters'
import { useAdminLogStats } from '../_lib/use-admin-log-stats'
import { useAdminLogTags } from '../_lib/use-admin-log-tags'
import { useAdminLogsList } from '../_lib/use-admin-logs-list'
import {
  readLogsLiveEnabledPreference,
  writeLogsLiveEnabledPreference,
} from '../_lib/logs-live-preference'
import { useAdminLogsRealtime } from '../_lib/use-admin-logs-realtime'
import { useMarkAllLogsReadMutation } from '../_lib/use-mark-all-logs-read-mutation'
import { useMarkLogReadMutation } from '../_lib/use-mark-log-read-mutation'
import { useMarkLogUnreadMutation } from '../_lib/use-mark-log-unread-mutation'
import { LogDetailDialog } from './log-detail-dialog'
import { LogsActiveFilters } from './logs-active-filters'
import { LogsFilteredEmptyState } from './logs-filtered-empty-state'
import { createLogsColumns } from './logs-columns'
import { LogsStatTiles } from './logs-stat-tiles'
import { LogsToolbar } from './logs-toolbar'

const DEFAULT_SORTING: SortingState = [{ id: 'createdAt', desc: true }]

export const LogsTable = () => {
  const [cursorStack, setCursorStack] = useState<Array<AppLogCursor | null>>([
    null,
  ])
  const [cursorStackIndex, setCursorStackIndex] = useState(0)
  const [perPage, setPerPage] = useState<DataTablePageSize>(
    DATA_TABLE_DEFAULT_PAGE_SIZE,
  )
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING)
  const [selectedLog, setSelectedLog] = useState<AppLogRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [trackedDebouncedSearch, setTrackedDebouncedSearch] =
    useState(debouncedSearch)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [liveEnabled, setLiveEnabled] = useState(false)
  const {
    activeValues: selectedLevelSet,
    toggle: toggleLevel,
    clearAll: clearLevelFilters,
  } = useToggleFilterSet<LogLevel>()

  const selectedLevels = useMemo(
    () => [...selectedLevelSet],
    [selectedLevelSet],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard for localStorage preference restore
    setLiveEnabled(readLogsLiveEnabledPreference())
  }, [])

  if (trackedDebouncedSearch !== debouncedSearch) {
    setTrackedDebouncedSearch(debouncedSearch)
    setCursorStack([null])
    setCursorStackIndex(0)
  }

  const handleLiveEnabledChange = useCallback((enabled: boolean) => {
    setLiveEnabled(enabled)
    writeLogsLiveEnabledPreference(enabled)
  }, [])

  const filters: LogListFilters = useMemo(
    () => ({
      levels: selectedLevels,
      unreadOnly,
      tag: selectedTag,
      search: debouncedSearch.trim() || null,
    }),
    [debouncedSearch, selectedLevels, selectedTag, unreadOnly],
  )

  const activeSort = sorting[0]
  const sortDirection: LogsSortDirection = activeSort?.desc ? 'desc' : 'asc'
  const cursor = cursorStack[cursorStackIndex] ?? null
  const page = cursorStackIndex + 1

  const { refresh, isRefreshing } = useAdminLogsRealtime({
    enabled: liveEnabled,
  })
  const {
    stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useAdminLogStats()
  const { tags, error: tagsError } = useAdminLogTags()
  const {
    rows,
    hasNextPage,
    filteredUnreadCount,
    isLoading,
    isFetching,
    error,
  } = useAdminLogsList({
    cursor,
    sortDirection,
    perPage,
    filters,
  })

  const { mutate: markLogRead, error: markLogReadError } =
    useMarkLogReadMutation()
  const {
    mutate: markLogUnread,
    isPending: isMarkUnreadPending,
    error: markLogUnreadError,
  } = useMarkLogUnreadMutation()
  const {
    mutate: markAllLogsRead,
    isPending: isMarkAllPending,
    error: markAllReadError,
  } = useMarkAllLogsReadMutation()

  const mutationAppError =
    (markLogReadError ?? markLogUnreadError ?? markAllReadError)
      ? toAppError(markLogReadError ?? markLogUnreadError ?? markAllReadError)
      : null

  const resetCursorStack = useCallback(() => {
    setCursorStack([null])
    setCursorStackIndex(0)
  }, [])

  const handleFiltersChange = useCallback(() => {
    resetCursorStack()
  }, [resetCursorStack])

  const handleResetFilters = useCallback(() => {
    clearLevelFilters()
    setUnreadOnly(false)
    setSearchInput('')
    setSelectedTag(null)
    resetCursorStack()
  }, [clearLevelFilters, resetCursorStack])

  const handleRemoveFilterChip = useCallback(
    (id: string) => {
      if (id.startsWith('level:')) {
        const level = id.slice('level:'.length)

        if (isLogLevel(level)) {
          toggleLevel(level)
          handleFiltersChange()
        }

        return
      }

      switch (id) {
        case 'unread':
          setUnreadOnly(false)
          handleFiltersChange()
          break
        case 'tag':
          setSelectedTag(null)
          handleFiltersChange()
          break
        case 'search':
          setSearchInput('')
          resetCursorStack()
          break
      }
    },
    [handleFiltersChange, resetCursorStack, toggleLevel],
  )

  const handleLevelToggle = useCallback(
    (level: LogLevel) => {
      toggleLevel(level)
      handleFiltersChange()
    },
    [handleFiltersChange, toggleLevel],
  )

  const handleUnreadToggle = useCallback(() => {
    setUnreadOnly((current) => !current)
    handleFiltersChange()
  }, [handleFiltersChange])

  const handleTagChange = useCallback(
    (tag: string | null) => {
      setSelectedTag(tag)
      handleFiltersChange()
    },
    [handleFiltersChange],
  )

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  const handleSortingChange = useCallback(
    (next: SortingState) => {
      setSorting(next)
      resetCursorStack()
    },
    [resetCursorStack],
  )

  const handlePageSizeChange = useCallback(
    (nextPageSize: number) => {
      setPerPage(nextPageSize as DataTablePageSize)
      resetCursorStack()
    },
    [resetCursorStack],
  )

  const handlePrevious = useCallback(() => {
    setCursorStackIndex((current) => Math.max(0, current - 1))
  }, [])

  const handleNext = useCallback(() => {
    const lastRow = rows.at(-1)

    if (!lastRow) {
      return
    }

    setCursorStack((current) => {
      const nextStack = current.slice(0, cursorStackIndex + 1)
      nextStack.push({ createdAt: lastRow.createdAt, id: lastRow.id })
      return nextStack
    })
    setCursorStackIndex((current) => current + 1)
  }, [cursorStackIndex, rows])

  const handleRowClick = useCallback(
    (row: AppLogRow) => {
      if (row.isUnread) {
        markLogRead(row.id)
        setSelectedLog({
          ...row,
          isUnread: false,
          readAt: new Date().toISOString(),
        })
      } else {
        setSelectedLog(row)
      }

      setDetailOpen(true)
    },
    [markLogRead],
  )

  const handleMarkUnread = useCallback(
    (id: number) => {
      markLogUnread(id)
      setSelectedLog((current) =>
        current?.id === id
          ? { ...current, isUnread: true, readAt: null }
          : current,
      )
    },
    [markLogUnread],
  )

  const handleMarkRead = useCallback(
    (id: number) => {
      markLogRead(id)
    },
    [markLogRead],
  )

  const handleMarkAllRead = useCallback(() => {
    markAllLogsRead(filters)
  }, [filters, markAllLogsRead])

  const columns = useMemo(
    () => createLogsColumns({ onMarkRead: handleMarkRead }),
    [handleMarkRead],
  )

  const showFilteredEmptyState =
    !isLoading && rows.length === 0 && hasActiveLogListFilters(filters)

  const markAllTooltip = buildMarkAllLogsReadTooltip(
    filteredUnreadCount,
    filters,
  )

  const { table } = useDataTableShell({
    data: rows,
    columns,
    getRowId: (row) => String(row.id),
    manualSorting: true,
    sorting,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      handleSortingChange(next)
    },
  })

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

      <div aria-busy={isFetching}>
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
      </div>

      <DataTablePaginationControls
        page={page}
        hasNextPage={hasNextPage}
        isPending={isFetching}
        onPrevious={handlePrevious}
        onNext={handleNext}
        pageSize={perPage}
        pageSizeOptions={DATA_TABLE_PAGE_SIZE_OPTIONS}
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
