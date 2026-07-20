'use client'

import { Loader2, RefreshCw, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { LogsLiveToggle } from './logs-live-toggle'
import { LogsTagCombobox } from './logs-tag-combobox'

interface LogsToolbarProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
  tags: string[]
  tagsDisabled?: boolean
  liveEnabled: boolean
  onLiveEnabledChange: (enabled: boolean) => void
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
  liveEnabled,
  onLiveEnabledChange,
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
      <LogsLiveToggle
        liveEnabled={liveEnabled}
        onLiveEnabledChange={onLiveEnabledChange}
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0"
        disabled={isRefreshing}
        onClick={onRefresh}
        aria-label="Refresh logs"
        aria-busy={isRefreshing}
      >
        {isRefreshing ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="size-4" aria-hidden />
        )}
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
