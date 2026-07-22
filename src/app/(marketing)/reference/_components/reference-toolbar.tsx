'use client'

import { Loader2, RefreshCw, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ReferenceToolbarProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  onRefresh: () => void
  isRefreshing: boolean
}

export const ReferenceToolbar = ({
  searchInput,
  onSearchInputChange,
  onRefresh,
  isRefreshing,
}: ReferenceToolbarProps) => (
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
        placeholder="Search by consignee…"
        className="pl-9"
        aria-label="Search shipments by consignee"
      />
    </div>

    <Button
      type="button"
      variant="outline"
      size="icon"
      className="shrink-0 sm:ml-auto"
      disabled={isRefreshing}
      onClick={onRefresh}
      aria-label="Refresh shipments"
      aria-busy={isRefreshing}
    >
      {isRefreshing ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <RefreshCw className="size-4" aria-hidden />
      )}
    </Button>
  </div>
)
