'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/data-table1'
import { Badge } from '@/components/ui/badge'

import { SEARCHABLE_COLUMN, type AdminUserRow } from '../_lib/admin-user-row'

export const usersColumns: ColumnDef<AdminUserRow, unknown>[] = [
  {
    accessorKey: SEARCHABLE_COLUMN,
    meta: { searchable: true },
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'lastSignInAtLabel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last sign-in" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'isAdmin',
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
