'use client'

import type { Column, ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/data-table-shell'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/tailwind'

import {
  SEARCHABLE_COLUMN,
  type ReferenceShipment,
  type ShipmentStatus,
} from '../_lib/reference-shipment'

const shipmentColumnHeader = ({
  column,
}: {
  column: Column<ReferenceShipment, unknown>
}) => (
  <DataTableColumnHeader
    column={column}
    title={column.columnDef.meta?.headerTitle ?? ''}
  />
)

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
    meta: {
      searchable: true,
      skeletonClassName: 'h-4 w-40 max-w-full',
      headerTitle: 'Consignee',
    },
    header: shipmentColumnHeader,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue(SEARCHABLE_COLUMN)}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'route',
    meta: { skeletonClassName: 'h-4 w-24', headerTitle: 'Route' },
    header: shipmentColumnHeader,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('route')}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    meta: { skeletonClassName: 'h-5 w-20 rounded-full', headerTitle: 'Status' },
    header: shipmentColumnHeader,
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
    meta: {
      cellClassName: 'text-right',
      skeletonClassName: 'inline-block h-4 w-16',
      headerTitle: 'Departs',
    },
    header: shipmentColumnHeader,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('departs')}</span>
    ),
    enableSorting: true,
  },
]
