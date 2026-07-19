'use client'

import { forwardRef, useRef, type Ref } from 'react'
import { XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/tailwind'

type BannerStartsAtFieldProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const openDateTimePicker = (input: HTMLInputElement | null) => {
  if (!input) {
    return
  }

  input.showPicker?.()
  input.focus()
}

export const BannerStartsAtField = forwardRef<
  HTMLButtonElement | HTMLInputElement,
  BannerStartsAtFieldProps
>(function BannerStartsAtField({ value, onChange, disabled, ...props }, ref) {
  const pickerRef = useRef<HTMLInputElement>(null)

  if (value) {
    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref as Ref<HTMLInputElement>}
          type="datetime-local"
          value={value}
          disabled={disabled}
          className="pr-9"
          onChange={(event) => onChange(event.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="absolute top-0 right-0 size-9"
          aria-label="Reset start time to now"
          onClick={() => onChange('')}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        {...props}
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        className={cn(
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-left text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        )}
        onClick={() => openDateTimePicker(pickerRef.current)}
      >
        <span className="text-muted-foreground">Now</span>
      </button>
      <input
        ref={pickerRef}
        type="datetime-local"
        tabIndex={-1}
        aria-hidden
        disabled={disabled}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        onChange={(event) => {
          if (event.target.value) {
            onChange(event.target.value)
          }
        }}
      />
    </div>
  )
})
