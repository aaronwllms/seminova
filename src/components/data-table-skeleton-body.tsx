import type { ColumnDef } from '@tanstack/react-table'

import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/utils/tailwind'

/** Skeleton rows shown while loading — intentionally fewer than page size (50). */
export const DEFAULT_LOADING_ROW_COUNT = 8

const DEFAULT_SKELETON_CLASS = 'h-4 w-full max-w-[8rem]'

interface DataTableSkeletonBodyProps<TData> {
  columns: Array<ColumnDef<TData, unknown>>
  rowCount?: number
}

export const DataTableSkeletonBody = <TData,>({
  columns,
  rowCount = DEFAULT_LOADING_ROW_COUNT,
}: DataTableSkeletonBodyProps<TData>) => (
  <>
    {Array.from({ length: rowCount }, (_, rowIndex) => (
      <TableRow key={`skeleton-row-${rowIndex}`}>
        {columns.map((column, columnIndex) => (
          <TableCell key={`skeleton-cell-${columnIndex}`} className="px-3">
            <Skeleton
              aria-hidden
              className={cn(
                DEFAULT_SKELETON_CLASS,
                column.meta?.skeletonClassName,
              )}
            />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
)
