'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/data-table-shell'
import { cn } from '@/utils/tailwind'

import { buildLogRowCopyText } from '../_lib/build-log-row-copy-text'
import type { AppLogRow } from '../_lib/app-log-row'
import { LogCopyButton } from './log-copy-button'
import { LogLevelBadge } from './log-level-badge'
import { LogUnreadIndicator } from './log-unread-indicator'

interface CreateLogsColumnsOptions {
  onMarkRead: (id: number) => void
}

export const createLogsColumns = ({
  onMarkRead,
}: CreateLogsColumnsOptions): ColumnDef<AppLogRow, unknown>[] => [
  {
    id: 'unread',
    meta: {
      cellClassName: 'w-0 whitespace-nowrap',
      skeletonClassName: 'inline-block size-4 rounded-full',
    },
    header: () => <span className="sr-only">Read state</span>,
    cell: ({ row }) => (
      <LogUnreadIndicator
        isUnread={row.original.isUnread}
        logId={row.original.id}
        onMarkRead={() => onMarkRead(row.original.id)}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'timestampLabel',
    meta: {
      skeletonClassName: 'h-4 w-40 font-mono',
      cellClassName: 'font-mono text-sm',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timestamp" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'level',
    meta: { skeletonClassName: 'h-5 w-14 rounded-full' },
    header: () => (
      <span className="text-foreground flex h-8 items-center text-sm font-medium">
        Level
      </span>
    ),
    cell: ({ row }) => <LogLevelBadge level={row.original.level} />,
    enableSorting: false,
  },
  {
    accessorKey: 'tag',
    meta: {
      skeletonClassName: 'h-4 w-24 font-mono',
      cellClassName: 'font-mono text-sm',
    },
    header: () => (
      <span className="text-foreground flex h-8 items-center text-sm font-medium">
        Tag
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'message',
    meta: { skeletonClassName: 'h-4 w-64 max-w-full' },
    header: () => (
      <span className="text-foreground flex h-8 items-center text-sm font-medium">
        Message
      </span>
    ),
    cell: ({ row }) => (
      <span
        className={cn(
          'block max-w-md truncate',
          row.original.isUnread ? 'font-medium' : 'text-muted-foreground',
        )}
      >
        {row.original.message}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    meta: {
      cellClassName: 'w-0 whitespace-nowrap text-right',
      skeletonClassName: 'inline-block h-7 w-16',
    },
    header: () => <span className="sr-only">Copy log row</span>,
    cell: ({ row }) => (
      <div
        className="flex justify-end"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <LogCopyButton
          copyText={buildLogRowCopyText({
            createdAt: row.original.createdAt,
            level: row.original.level,
            tag: row.original.tag,
            message: row.original.message,
            context: row.original.context,
          })}
          ariaLabel={`Copy log row ${row.original.id}`}
          onCopy={
            row.original.isUnread
              ? () => onMarkRead(row.original.id)
              : undefined
          }
        />
      </div>
    ),
    enableSorting: false,
  },
]
