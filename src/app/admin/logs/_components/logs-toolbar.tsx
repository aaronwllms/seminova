'use client'

import { Loader2, RefreshCw, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import type { LogListFilters } from '../_lib/log-list-filters'
import { LogsActiveFilters } from './logs-active-filters'
import { LogsLiveToggle } from './logs-live-toggle'
import { LogsTagCombobox } from './logs-tag-combobox'

interface LogsToolbarProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  filters: LogListFilters
  onRemoveFilter: (id: string) => void
  onClearAllFilters: () => void
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
  tags: string[]
  tagsDisabled?: boolean
  liveEnabled: boolean
  onLiveEnabledChange: (enabled: boolean) => void
  onRefresh: () => void
  isRefreshing: boolean
  isFetching?: boolean
  onMarkAllRead: () => void
  markAllDisabled: boolean
  markAllTooltip: string
  isMarkAllPending: boolean
}

export const LogsToolbar = ({
  searchInput,
  onSearchInputChange,
  filters,
  onRemoveFilter,
  onClearAllFilters,
  selectedTag,
  onTagChange,
  tags,
  tagsDisabled = false,
  liveEnabled,
  onLiveEnabledChange,
  onRefresh,
  isRefreshing,
  isFetching = false,
  onMarkAllRead,
  markAllDisabled,
  markAllTooltip,
  isMarkAllPending,
}: LogsToolbarProps) => {
  const showRefreshSpinner = isRefreshing || isFetching

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
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

      <LogsActiveFilters
        filters={filters}
        onRemove={onRemoveFilter}
        onClearAll={onClearAllFilters}
      />

      <LogsTagCombobox
        tags={tags}
        selectedTag={selectedTag}
        onTagChange={onTagChange}
        disabled={tagsDisabled}
      />

      <div className="flex shrink-0 flex-wrap items-center gap-2">
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
          aria-busy={showRefreshSpinner}
        >
          {showRefreshSpinner ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="size-4" aria-hidden />
          )}
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                disabled={markAllDisabled || isMarkAllPending}
                onClick={onMarkAllRead}
              >
                Mark all as read
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{markAllTooltip}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
