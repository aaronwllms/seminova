'use client'

import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
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
    /** Tailwind classes for the Skeleton in each cell when loading (e.g. "h-5 w-16 rounded-full") */
    skeletonClassName?: string
  }
}

type UseDataTableOptions<TData> = {
  data: Array<TData>
  columns: Array<ColumnDef<TData, unknown>>
  getRowId?: (row: TData) => string
  initialSorting?: SortingState
}

export const useDataTable = <TData,>(options: UseDataTableOptions<TData>) => {
  const { data, columns, getRowId, initialSorting = [] } = options

  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return {
    table,
    sorting,
    setSorting,
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
  className?: string
  isLoading?: boolean
  loadingRowCount?: number
  loadingLabel?: string
}

export const DataTableShell = <TData,>({
  table,
  columns,
  emptyMessage = 'No results.',
  className,
  isLoading = false,
  loadingRowCount = DEFAULT_LOADING_ROW_COUNT,
  loadingLabel = 'Loading…',
}: DataTableShellProps<TData>) => {
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
                <TableHead key={header.id} className="px-3">
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
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
