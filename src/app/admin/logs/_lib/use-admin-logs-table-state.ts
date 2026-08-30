'use client'

import { useQuery } from '@tanstack/react-query'
import type { SortingState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  ADMIN_ACTION_QUERY_RETRY_DELAY,
  adminActionQueryRetry,
} from '@/app/admin/_lib/admin-query-options'
import { unwrapActionResult } from '@/app/admin/_lib/unwrap-action-result'
import { useDataTableShell } from '@/components/data-table-shell'
import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
  type DataTablePageSize,
} from '@/constants/data-table'
import { useToggleFilterSet } from '@/hooks/use-toggle-filter-set'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useResetOnChange } from '@/hooks/use-reset-on-change'
import type { LogLevel } from '@/types/app-settings'
import { toAppError } from '@/utils/is-app-error'

import { listLogTagsAction } from '../actions'
import type { AppLogCursor, AppLogRow, LogsSortDirection } from './app-log-row'
import { isLogLevel } from './app-log-row'
import { adminLogsQueryKeys } from './admin-logs-query-keys'
import {
  type LogListFilters,
  buildMarkAllLogsReadTooltip,
  hasActiveLogListFilters,
} from './log-list-filters'
import {
  readLogsLiveEnabledPreference,
  writeLogsLiveEnabledPreference,
} from './logs-live-preference'
import { useAdminLogStats } from './use-admin-log-stats'
import { useAdminLogsList } from './use-admin-logs-list'
import { useAdminLogsRealtime } from './use-admin-logs-realtime'
import { useMarkAllLogsReadMutation } from './use-mark-all-logs-read-mutation'
import { useMarkLogReadMutation } from './use-mark-log-read-mutation'
import { useMarkLogUnreadMutation } from './use-mark-log-unread-mutation'
import { createLogsColumns } from '../_components/logs-columns'

const DEFAULT_SORTING: SortingState = [{ id: 'createdAt', desc: true }]

export const useAdminLogsTableState = () => {
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

  useResetOnChange(debouncedSearch, () => {
    setCursorStack([null])
    setCursorStackIndex(0)
  })

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
  const tagsQuery = useQuery({
    queryKey: adminLogsQueryKeys.tags(),
    queryFn: async () => unwrapActionResult(await listLogTagsAction()),
    retry: adminActionQueryRetry,
    retryDelay: ADMIN_ACTION_QUERY_RETRY_DELAY,
  })
  const tags = tagsQuery.data ?? []
  const tagsError = tagsQuery.isError ? toAppError(tagsQuery.error) : null
  const {
    rows,
    hasNextPage,
    filteredUnreadCount,
    isLoading,
    isFetching,
    error: listError,
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

  return {
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
    listError,
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
    pageSizeOptions: DATA_TABLE_PAGE_SIZE_OPTIONS,
    selectedLog,
    detailOpen,
    setDetailOpen,
    handleMarkUnread,
    isMarkUnreadPending,
  }
}
