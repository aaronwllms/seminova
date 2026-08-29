'use client'

import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

import {
  DataTableSkeletonBody,
  DEFAULT_LOADING_ROW_COUNT,
} from '@/components/data-table-skeleton-body'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/utils/tailwind'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    searchable?: boolean
    /** Tailwind classes applied to header and body cells (e.g. "text-right", "w-0 whitespace-nowrap") */
    cellClassName?: string
    /** Tailwind classes for the Skeleton in each cell when loading (e.g. "h-5 w-16 rounded-full") */
    skeletonClassName?: string
    /** Display title for a fallback header that cannot run the live `header` render function */
    headerTitle?: string
  }
}

const getColumnCellClassName = (meta: { cellClassName?: string } | undefined) =>
  cn('px-3', meta?.cellClassName)

type UseDataTableShellBaseOptions<TData> = {
  data: Array<TData>
  columns: Array<ColumnDef<TData, unknown>>
  getRowId?: (row: TData) => string
  manualSorting?: boolean
}

type UseDataTableShellControlledOptions<TData> =
  UseDataTableShellBaseOptions<TData> & {
    sorting: SortingState
    onSortingChange: OnChangeFn<SortingState>
    initialSorting?: never
  }

type UseDataTableShellUncontrolledOptions<TData> =
  UseDataTableShellBaseOptions<TData> & {
    initialSorting?: SortingState
    sorting?: never
    onSortingChange?: never
  }

type UseDataTableShellOptions<TData> =
  | UseDataTableShellControlledOptions<TData>
  | UseDataTableShellUncontrolledOptions<TData>

export const useDataTableShell = <TData,>(
  options: UseDataTableShellOptions<TData>,
) => {
  const { data, columns, getRowId, manualSorting = false } = options

  const isControlled = options.sorting !== undefined
  const [uncontrolledSorting, setUncontrolledSorting] =
    React.useState<SortingState>(
      isControlled ? [] : (options.initialSorting ?? []),
    )
  const sorting = isControlled ? options.sorting : uncontrolledSorting
  const onSortingChange = isControlled
    ? options.onSortingChange
    : setUncontrolledSorting

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting },
    onSortingChange,
    manualSorting,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
  })

  return {
    table,
    sorting,
    setSorting: onSortingChange,
  }
}

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
}

export const DataTableColumnHeader = <TData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) => {
  const canSort = column.getCanSort()
  const sorted = column.getIsSorted()

  if (!canSort) {
    return (
      <span className="text-foreground flex h-8 items-center text-sm font-medium">
        {title}
      </span>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-foreground flex h-8 items-center gap-2 px-0 text-sm font-medium"
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      <span>{title}</span>
      {sorted === 'desc' ? (
        <ArrowDown className="h-4 w-4" />
      ) : sorted === 'asc' ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      )}
    </Button>
  )
}

type DataTableShellProps<TData> = {
  table: ReturnType<typeof useReactTable<TData>>
  columns: Array<ColumnDef<TData, unknown>>
  emptyMessage?: string
  emptyContent?: React.ReactNode
  className?: string
  isLoading?: boolean
  loadingRowCount?: number
  loadingLabel?: string
  onRowClick?: (row: TData) => void
  getRowAccessibilityLabel?: (row: TData) => string
  getRowClassName?: (row: TData) => string | undefined
}

export const DataTableShell = <TData,>({
  table,
  columns,
  emptyMessage = 'No results.',
  emptyContent,
  className,
  isLoading = false,
  loadingRowCount = DEFAULT_LOADING_ROW_COUNT,
  loadingLabel = 'Loading…',
  onRowClick,
  getRowAccessibilityLabel,
  getRowClassName,
}: DataTableShellProps<TData>) => {
  const activateRow = onRowClick
    ? (row: TData) => {
        onRowClick(row)
      }
    : undefined

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    row: TData,
  ) => {
    if (!activateRow) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activateRow(row)
    }
  }
  const hasRows = table.getRowModel().rows.length > 0
  const showSkeleton = isLoading && !hasRows

  return (
    <div className={cn('overflow-hidden rounded-md border', className)}>
      {showSkeleton ? <span className="sr-only">{loadingLabel}</span> : null}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={getColumnCellClassName(
                    header.column.columnDef.meta,
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {showSkeleton ? (
            <DataTableSkeletonBody
              columns={columns}
              rowCount={loadingRowCount}
            />
          ) : hasRows ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  activateRow
                    ? 'focus-visible:ring-ring focus-visible:ring-offset-background cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                    : undefined,
                  getRowClassName?.(row.original),
                )}
                tabIndex={activateRow ? 0 : undefined}
                aria-label={
                  activateRow
                    ? (getRowAccessibilityLabel?.(row.original) ??
                      'View row details')
                    : undefined
                }
                onClick={
                  activateRow
                    ? () => {
                        activateRow(row.original)
                      }
                    : undefined
                }
                onKeyDown={
                  activateRow
                    ? (event) => {
                        handleRowKeyDown(event, row.original)
                      }
                    : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={getColumnCellClassName(
                      cell.column.columnDef.meta,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyContent ?? emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
