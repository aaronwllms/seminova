import type { ColumnDef } from '@tanstack/react-table'

import { DataTablePaginationControls } from '@/components/data-table-pagination-controls'
import { DataTableSkeletonBody } from '@/components/data-table-skeleton-body'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const SKELETON_COLUMNS: Array<ColumnDef<ReferenceShipment, unknown>> = [
  { id: 'consignee', meta: { skeletonClassName: 'h-4 w-40 max-w-full' } },
  { id: 'route', meta: { skeletonClassName: 'h-4 w-24' } },
  { id: 'status', meta: { skeletonClassName: 'h-5 w-20 rounded-full' } },
  { id: 'departs', meta: { skeletonClassName: 'h-4 w-16 ml-auto' } },
]

const TABLE_HEADERS = ['Consignee', 'Route', 'Status', 'Departs'] as const

export const ReferenceTableDemoFallback = () => (
  <div className="mx-auto mt-5 max-w-6xl px-4 sm:px-0">
    <div className="bg-card overflow-hidden rounded-xl border">
      <div className="border-b p-3">
        <Label htmlFor="reference-shipments-search" className="sr-only">
          Search shipments
        </Label>
        <Input
          id="reference-shipments-search"
          type="search"
          placeholder="Search shipments"
          disabled
          aria-disabled
        />
      </div>

      <div aria-busy>
        <span className="sr-only">Loading shipments…</span>
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_HEADERS.map((title, index) => (
                <TableHead
                  key={title}
                  className={
                    index === TABLE_HEADERS.length - 1
                      ? 'px-3 text-right'
                      : 'px-3'
                  }
                >
                  <span className="text-foreground flex h-8 items-center text-sm font-medium">
                    {title}
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

      <DataTablePaginationControls
        className="border-t p-3"
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
