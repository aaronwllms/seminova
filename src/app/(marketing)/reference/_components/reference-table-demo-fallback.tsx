'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTablePaginationControls } from '@/components/data-table-pagination-controls'
import { DataTableSkeletonBody } from '@/components/data-table-skeleton-body'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/tailwind'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
} from '@/constants/data-table'

import type { ReferenceShipment } from '../_lib/reference-shipment'

import { referenceShipmentsColumns } from './reference-shipments-columns'

const columnId = (column: ColumnDef<ReferenceShipment, unknown>) =>
  column.id ?? ('accessorKey' in column ? String(column.accessorKey) : 'column')

const SKELETON_COLUMNS: Array<ColumnDef<ReferenceShipment, unknown>> =
  referenceShipmentsColumns.map((column) => ({
    id: columnId(column),
    meta: {
      cellClassName: column.meta?.cellClassName,
      skeletonClassName: column.meta?.skeletonClassName,
      headerTitle: column.meta?.headerTitle,
    },
  }))

export const ReferenceTableDemoFallback = () => (
  <div className="mx-auto mt-5 max-w-6xl px-4 sm:px-0">
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[3.625rem] rounded-xl" />
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-9 shrink-0 sm:ml-auto" />
      </div>

      <div aria-busy>
        <span className="sr-only">Loading shipments…</span>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {SKELETON_COLUMNS.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn('px-3', column.meta?.cellClassName)}
                  >
                    <span className="text-foreground flex h-8 items-center text-sm font-medium">
                      {column.meta?.headerTitle}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <DataTableSkeletonBody columns={SKELETON_COLUMNS} />
            </TableBody>
          </Table>
        </div>
      </div>

      <DataTablePaginationControls
        page={1}
        hasNextPage={false}
        isPending
        onPrevious={() => undefined}
        onNext={() => undefined}
        pageSize={DATA_TABLE_DEFAULT_PAGE_SIZE}
        pageSizeOptions={DATA_TABLE_PAGE_SIZE_OPTIONS}
        onPageSizeChange={() => undefined}
      />
    </div>
  </div>
)
