'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/data-table-shell'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/tailwind'

import {
  SEARCHABLE_COLUMN,
  type ReferenceShipment,
  type ShipmentStatus,
} from '../_lib/reference-shipment'

const STATUS_BADGE_CLASS: Record<ShipmentStatus, string> = {
  Cleared: 'bg-secondary text-secondary-foreground',
  Held: 'bg-muted text-muted-foreground',
  'In transit': 'bg-primary/10 text-primary',
}

export const referenceShipmentsColumns: ColumnDef<
  ReferenceShipment,
  unknown
>[] = [
  {
    accessorKey: SEARCHABLE_COLUMN,
    meta: { searchable: true, skeletonClassName: 'h-4 w-40 max-w-full' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Consignee" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue(SEARCHABLE_COLUMN)}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'route',
    meta: { skeletonClassName: 'h-4 w-24' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Route" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('route')}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    meta: { skeletonClassName: 'h-5 w-20 rounded-full' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue<ShipmentStatus>('status')

      return (
        <Badge
          variant="outline"
          className={cn('border-transparent', STATUS_BADGE_CLASS[status])}
        >
          {status}
        </Badge>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'departs',
    meta: { skeletonClassName: 'h-4 w-16 ml-auto' },
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader column={column} title="Departs" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground text-right">
        {row.getValue('departs')}
      </div>
    ),
    enableSorting: true,
  },
]
