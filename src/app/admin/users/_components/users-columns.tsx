'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'

import { DataTableColumnHeader } from '@/components/data-table1'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { SEARCHABLE_COLUMN, type AdminUserRow } from '../_lib/admin-user-row'

export interface CreateUsersColumnsOptions {
  currentAdminUserId: string
  pendingUserId: string | null
  onPromote: (row: AdminUserRow) => void
  onDemote: (row: AdminUserRow) => void
}

export const createUsersColumns = ({
  currentAdminUserId,
  pendingUserId,
  onPromote,
  onDemote,
}: CreateUsersColumnsOptions): ColumnDef<AdminUserRow, unknown>[] => [
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
  {
    id: 'actions',
    meta: { skeletonClassName: 'h-8 w-8 rounded-md' },
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const user = row.original
      const isRowPending = pendingUserId === user.id
      const canPromote = !user.isAdmin
      const canDemote = user.isAdmin && user.id !== currentAdminUserId

      if (!canPromote && !canDemote) {
        return null
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isRowPending}
              aria-label={`Actions for ${user.email}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canPromote ? (
              <DropdownMenuItem
                disabled={isRowPending}
                onSelect={() => onPromote(user)}
              >
                Promote to admin
              </DropdownMenuItem>
            ) : null}
            {canDemote ? (
              <DropdownMenuItem
                disabled={isRowPending}
                variant="destructive"
                onSelect={() => onDemote(user)}
              >
                Demote from admin
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
  },
]
