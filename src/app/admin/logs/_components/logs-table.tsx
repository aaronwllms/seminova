'use client'

import type { SortingState } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'

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

import type {
  AppLogCursor,
  AppLogRow,
  LogsSortDirection,
} from '../_lib/app-log-row'
import { useAdminLogsList } from '../_lib/use-admin-logs-list'
import { LogDetailDialog } from './log-detail-dialog'
import { createLogsColumns } from './logs-columns'

const DEFAULT_SORTING: SortingState = [{ id: 'timestampLabel', desc: true }]

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

  const activeSort = sorting[0]
  const sortDirection: LogsSortDirection = activeSort?.desc ? 'desc' : 'asc'
  const cursor = cursorStack[cursorStackIndex] ?? null
  const page = cursorStackIndex + 1

  const { rows, hasNextPage, isLoading, isFetching, error } = useAdminLogsList({
    cursor,
    sortDirection,
    perPage,
  })

  const resetCursorStack = useCallback(() => {
    setCursorStack([null])
    setCursorStackIndex(0)
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

  const columns = useMemo(() => createLogsColumns(), [])

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
      {error ? <AppErrorSurface error={error} /> : null}

      <div aria-busy={isFetching}>
        <DataTableShell
          table={table}
          columns={columns}
          isLoading={isLoading && rows.length === 0}
          loadingLabel="Loading logs…"
          emptyMessage="No logs found."
          onRowClick={handleRowClick}
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
