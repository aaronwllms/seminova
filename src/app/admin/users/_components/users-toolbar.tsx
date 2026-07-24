'use client'

import { Loader2, RefreshCw, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { USERS_SEARCH_MIN_LENGTH } from '../_lib/admin-user-row'
import type { UserListFilters } from '../_lib/user-list-filters'
import { UsersActiveFilters } from './users-active-filters'

interface UsersToolbarProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  filters: UserListFilters
  onRemoveFilter: (id: string) => void
  onClearAllFilters: () => void
  onRefresh: () => void
  isRefreshing: boolean
  isFetching?: boolean
}

export const UsersToolbar = ({
  searchInput,
  onSearchInputChange,
  filters,
  onRemoveFilter,
  onClearAllFilters,
  onRefresh,
  isRefreshing,
  isFetching = false,
}: UsersToolbarProps) => {
  const showSearchHint =
    searchInput.trim().length > 0 &&
    searchInput.trim().length < USERS_SEARCH_MIN_LENGTH
  const showRefreshSpinner = isRefreshing || isFetching

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start">
      <div className="relative min-w-0 flex-1">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder="Search by email…"
          className="pl-9"
          aria-label="Search users by email"
          aria-describedby={
            showSearchHint ? 'users-email-search-hint' : undefined
          }
        />
        {showSearchHint ? (
          <p
            id="users-email-search-hint"
            className="text-muted-foreground mt-2 text-sm"
          >
            Enter at least {USERS_SEARCH_MIN_LENGTH} characters to search email.
          </p>
        ) : null}
      </div>

      <UsersActiveFilters
        filters={filters}
        onRemove={onRemoveFilter}
        onClearAll={onClearAllFilters}
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0"
        disabled={isRefreshing}
        onClick={onRefresh}
        aria-label="Refresh users"
        aria-busy={showRefreshSpinner}
      >
        {showRefreshSpinner ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="size-4" aria-hidden />
        )}
      </Button>
    </div>
  )
}
