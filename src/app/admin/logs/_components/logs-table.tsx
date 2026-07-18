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
import type { LogLevel } from '@/types/app-settings'

import type {
  AppLogCursor,
  AppLogRow,
  LogsSortDirection,
} from '../_lib/app-log-row'
import { type LogListFilters } from '../_lib/log-list-filters'
import { useAdminLogStats } from '../_lib/use-admin-log-stats'
import { useAdminLogTags } from '../_lib/use-admin-log-tags'
import { useAdminLogsList } from '../_lib/use-admin-logs-list'
import { useMarkAllLogsReadMutation } from '../_lib/use-mark-all-logs-read-mutation'
import { useMarkLogReadMutation } from '../_lib/use-mark-log-read-mutation'
import { LogDetailDialog } from './log-detail-dialog'
import { createLogsColumns } from './logs-columns'
import { LogsStatTiles } from './logs-stat-tiles'
import { LogsToolbar } from './logs-toolbar'

const DEFAULT_SORTING: SortingState = [{ id: 'timestampLabel', desc: true }]
const SEARCH_DEBOUNCE_MS = 300

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
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [unreadOnly, setUnreadOnly] = useState(false)
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
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setCursorStack([null])
      setCursorStackIndex(0)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  const filters: LogListFilters = useMemo(
    () => ({
      levels: selectedLevels,
      unreadOnly,
      tag: selectedTag,
      search: debouncedSearch || null,
    }),
    [debouncedSearch, selectedLevels, selectedTag, unreadOnly],
  )

  const activeSort = sorting[0]
  const sortDirection: LogsSortDirection = activeSort?.desc ? 'desc' : 'asc'
  const cursor = cursorStack[cursorStackIndex] ?? null
  const page = cursorStackIndex + 1

  const { stats } = useAdminLogStats()
  const { tags } = useAdminLogTags()
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

  const { mutate: markLogRead } = useMarkLogReadMutation()
  const { mutate: markAllLogsRead, isPending: isMarkAllPending } =
    useMarkAllLogsReadMutation()

  const resetCursorStack = useCallback(() => {
    setCursorStack([null])
    setCursorStackIndex(0)
  }, [])

  const handleFiltersChange = useCallback(() => {
    resetCursorStack()
  }, [resetCursorStack])

  const handleTotalClick = useCallback(() => {
    clearLevelFilters()
    setUnreadOnly(false)
    handleFiltersChange()
  }, [clearLevelFilters, handleFiltersChange])

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

  const handleRowClick = useCallback((row: AppLogRow) => {
    setSelectedLog(row)
    setDetailOpen(true)
  }, [])

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
      <LogsStatTiles
        stats={stats}
        selectedLevels={selectedLevels}
        unreadOnly={unreadOnly}
        onTotalClick={handleTotalClick}
        onLevelToggle={handleLevelToggle}
        onUnreadToggle={handleUnreadToggle}
      />

      <LogsToolbar
        searchInput={searchInput}
        onSearchInputChange={handleSearchInputChange}
        selectedTag={selectedTag}
        onTagChange={handleTagChange}
        tags={tags}
        onMarkAllRead={handleMarkAllRead}
        markAllDisabled={filteredUnreadCount === 0}
        isMarkAllPending={isMarkAllPending}
      />

      {error ? <AppErrorSurface error={error} /> : null}

      <div aria-busy={isFetching}>
        <DataTableShell
          table={table}
          columns={columns}
          isLoading={isLoading && rows.length === 0}
          loadingLabel="Loading logs…"
          emptyMessage="No logs found."
          onRowClick={handleRowClick}
          getRowAccessibilityLabel={(row) =>
            `${row.isUnread ? 'Unread log' : 'Read log'}: ${row.timestampLabel}, ${row.level}, ${row.tag}, ${row.message}`
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
      />
    </div>
  )
}
