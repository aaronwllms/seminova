'use client'

import { RefreshCw, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/tailwind'

import type { AdminLogsConnectionState } from '../_lib/use-admin-logs-realtime'
import { LogsConnectionIndicator } from './logs-connection-indicator'
import { LogsTagCombobox } from './logs-tag-combobox'

interface LogsToolbarProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
  tags: string[]
  tagsDisabled?: boolean
  connectionState: AdminLogsConnectionState
  onRefresh: () => void
  isRefreshing: boolean
  onMarkAllRead: () => void
  markAllDisabled: boolean
  isMarkAllPending: boolean
}

export const LogsToolbar = ({
  searchInput,
  onSearchInputChange,
  selectedTag,
  onTagChange,
  tags,
  tagsDisabled = false,
  connectionState,
  onRefresh,
  isRefreshing,
  onMarkAllRead,
  markAllDisabled,
  isMarkAllPending,
}: LogsToolbarProps) => (
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
    <div className="relative min-w-0 flex-1">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden
      />
      <Input
        type="search"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        placeholder="Search message, context, or tag"
        className="pl-9"
        aria-label="Search logs"
      />
    </div>

    <LogsTagCombobox
      tags={tags}
      selectedTag={selectedTag}
      onTagChange={onTagChange}
      disabled={tagsDisabled}
    />

    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
      <LogsConnectionIndicator connectionState={connectionState} />

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0"
        disabled={isRefreshing}
        onClick={onRefresh}
        aria-label="Refresh logs"
      >
        <RefreshCw
          className={cn('size-4', isRefreshing && 'animate-spin')}
          aria-hidden
        />
      </Button>

      <Button
        type="button"
        variant="outline"
        className="shrink-0"
        disabled={markAllDisabled || isMarkAllPending}
        onClick={onMarkAllRead}
      >
        Mark all as read
      </Button>
    </div>
  </div>
)
