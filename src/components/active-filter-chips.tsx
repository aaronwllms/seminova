'use client'

import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface ActiveFilterChip {
  id: string
  label: string
}

interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[]
  onRemove: (id: string) => void
  onClearAll: () => void
}

export const ActiveFilterChips = ({
  chips,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) => {
  if (chips.length === 0) {
    return null
  }

  return (
    <div
      role="group"
      aria-label="Active filters"
      className="flex shrink-0 flex-wrap items-center gap-2"
    >
      {chips.map((chip) => (
        <Badge key={chip.id} variant="secondary" className="gap-1 pr-1.5 pl-3">
          {chip.label}
          <button
            type="button"
            className="hover:bg-secondary-foreground/10 focus-visible:ring-ring inline-flex size-6 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            aria-label={`Remove ${chip.label} filter`}
            onClick={() => onRemove(chip.id)}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </Badge>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  )
}
