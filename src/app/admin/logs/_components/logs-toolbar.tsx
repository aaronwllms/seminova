'use client'

import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LogsToolbarProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
  tags: string[]
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

    <Select
      value={selectedTag ?? '__all__'}
      onValueChange={(value) => onTagChange(value === '__all__' ? null : value)}
    >
      <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by tag">
        <SelectValue placeholder="All tags" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All tags</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag} value={tag}>
            {tag}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

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
)
