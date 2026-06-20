'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/data-table1'
import { Badge } from '@/components/ui/badge'

import { SEARCHABLE_COLUMN, type AdminUserRow } from '../_lib/admin-user-row'

export const usersColumns: ColumnDef<AdminUserRow, unknown>[] = [
  {
    accessorKey: SEARCHABLE_COLUMN,
    meta: { searchable: true, skeletonClassName: 'h-4 w-48 max-w-full' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue(SEARCHABLE_COLUMN)}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'isVerified',
    meta: { skeletonClassName: 'h-5 w-20 rounded-md' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verified" />
    ),
    cell: ({ row }) => {
      const isVerified = row.getValue<boolean>('isVerified')

      return isVerified ? (
        <Badge variant="secondary">Verified</Badge>
      ) : (
        <Badge variant="outline">Unverified</Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAtLabel',
    meta: { skeletonClassName: 'h-4 w-28' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'lastSignInAtLabel',
    meta: { skeletonClassName: 'h-4 w-28' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last sign-in" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'isAdmin',
    meta: { skeletonClassName: 'h-5 w-14 rounded-md' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const isAdmin = row.getValue<boolean>('isAdmin')

      return isAdmin ? <Badge>Admin</Badge> : null
    },
    enableSorting: false,
  },
]
