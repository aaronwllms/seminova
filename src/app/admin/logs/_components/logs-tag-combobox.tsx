'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/tailwind'

interface LogsTagComboboxProps {
  tags: string[]
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
  disabled?: boolean
}

export const LogsTagCombobox = ({
  tags,
  selectedTag,
  onTagChange,
  disabled = false,
}: LogsTagComboboxProps) => {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filteredTags = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return tags
    }

    return tags.filter((tag) => tag.toLowerCase().includes(normalizedQuery))
  }, [query, tags])

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [open])

  const handleSelectAllTags = () => {
    onTagChange(null)
    setOpen(false)
    setQuery('')
  }

  const handleSelectTag = (tag: string) => {
    onTagChange(tag)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-[220px]">
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label="Filter by tag"
        disabled={disabled}
        className="w-full justify-between font-normal"
        onClick={() => {
          if (disabled) {
            return
          }

          setOpen((current) => !current)
        }}
      >
        <span className="truncate">{selectedTag ?? 'All tags'}</span>
        <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
      </Button>

      {open ? (
        <div className="bg-popover text-popover-foreground surface-elevated border-border absolute z-20 mt-1 w-full rounded-md border shadow-md">
          <div className="border-border border-b p-2">
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tags…"
              aria-label="Search tags"
              autoFocus
            />
          </div>
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Log tags"
            className="max-h-56 overflow-y-auto p-1"
          >
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={selectedTag === null}
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
                  selectedTag === null && 'bg-accent text-accent-foreground',
                )}
                onClick={handleSelectAllTags}
              >
                <Check
                  className={cn(
                    'size-4 shrink-0',
                    selectedTag === null ? 'opacity-100' : 'opacity-0',
                  )}
                />
                All tags
              </button>
            </li>
            {filteredTags.length === 0 ? (
              <li className="text-muted-foreground px-2 py-2 text-sm">
                No matching tags
              </li>
            ) : (
              filteredTags.map((tag) => (
                <li key={tag} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedTag === tag}
                    className={cn(
                      'hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
                      selectedTag === tag && 'bg-accent text-accent-foreground',
                    )}
                    onClick={() => handleSelectTag(tag)}
                  >
                    <Check
                      className={cn(
                        'size-4 shrink-0',
                        selectedTag === tag ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="truncate">{tag}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
