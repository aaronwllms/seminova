'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTablePaginationControls } from '@/components/data-table-pagination-controls'
import { DataTableSkeletonBody } from '@/components/data-table-skeleton-body'
import { Skeleton } from '@/components/ui/skeleton'
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
import { cn } from '@/utils/tailwind'

import type { AdminUserRow } from '../_lib/admin-user-row'

const SKELETON_COLUMNS: Array<ColumnDef<AdminUserRow, unknown>> = [
  { id: 'email', meta: { skeletonClassName: 'h-4 w-48 max-w-full' } },
  { id: 'isVerified', meta: { skeletonClassName: 'h-5 w-20 rounded-md' } },
  { id: 'createdAtLabel', meta: { skeletonClassName: 'h-4 w-28' } },
  { id: 'lastSignInAtLabel', meta: { skeletonClassName: 'h-4 w-28' } },
  { id: 'isAdmin', meta: { skeletonClassName: 'h-5 w-14 rounded-md' } },
  {
    id: 'banStatus',
    meta: {
      cellClassName: 'w-0 whitespace-nowrap',
      skeletonClassName: 'h-5 w-28 rounded-md',
    },
  },
  {
    id: 'actions',
    meta: {
      cellClassName: 'min-w-20 whitespace-nowrap text-center',
      skeletonClassName: 'inline-block h-8 w-8 rounded-md',
    },
  },
]

const TABLE_HEADERS = [
  'Email',
  'Verified',
  'Created',
  'Last sign-in',
  'Role',
  'Ban',
  'Actions',
] as const

export const UsersTableFallback = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
        aria-busy="true"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[3.625rem] rounded-xl" />
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-9 shrink-0 sm:ml-auto" />
      </div>
    </div>

    <div aria-busy>
      <span className="sr-only">Loading users…</span>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {SKELETON_COLUMNS.map((column, index) => (
                <TableHead
                  key={TABLE_HEADERS[index]}
                  className={cn('px-3', column.meta?.cellClassName)}
                >
                  {TABLE_HEADERS[index] === 'Actions' ? (
                    <span className="sr-only">{TABLE_HEADERS[index]}</span>
                  ) : (
                    <span className="text-foreground flex h-8 items-center text-sm font-medium">
                      {TABLE_HEADERS[index]}
                    </span>
                  )}
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
)
