import type { ColumnDef } from '@tanstack/react-table'

import { DataTableSkeletonBody } from '@/components/data-table-skeleton-body'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

      <div className="flex items-center justify-end gap-2 border-t p-3">
        <Button type="button" variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button type="button" variant="outline" size="sm" disabled>
          Next
        </Button>
      </div>
    </div>
  </div>
)
