'use client'

import { cva, type VariantProps } from 'class-variance-authority'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/utils/tailwind'

/** Supplementary hints — slower than sidebar icon labels (provider delay 0). */
const STAT_TILE_TOOLTIP_DELAY_MS = 500
/** TW4 `duration-*` sets transition-duration; tooltips animate via `animation`. */
const STAT_TILE_TOOLTIP_FADE_CLASS = '[animation-duration:300ms]'

const statTileVariants = cva(
  'cursor-pointer rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      role: {
        total:
          'bg-card text-muted-foreground border-[0.5px] border-border hover:bg-muted/80',
        debug:
          'bg-muted/50 text-muted-foreground border-[0.5px] border-border hover:bg-muted',
        info: 'bg-info/15 text-info border-[0.5px] border-info hover:bg-info/25',
        warn: 'bg-warning/15 text-warning border-[0.5px] border-warning hover:bg-warning/25',
        error:
          'bg-destructive/10 text-destructive border-[0.5px] border-destructive hover:bg-destructive/15',
        unread:
          'bg-unread/10 text-unread border-[0.5px] border-unread hover:bg-unread/15',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        role: 'total',
        selected: true,
        className: 'border-2 border-muted-foreground',
      },
      {
        role: 'debug',
        selected: true,
        className: 'border-2 border-muted-foreground',
      },
      {
        role: 'info',
        selected: true,
        className: 'border-2 border-info',
      },
      {
        role: 'warn',
        selected: true,
        className: 'border-2 border-warning',
      },
      {
        role: 'error',
        selected: true,
        className: 'border-2 border-destructive',
      },
      {
        role: 'unread',
        selected: true,
        className: 'border-2 border-unread',
      },
    ],
    defaultVariants: {
      role: 'total',
      selected: false,
    },
  },
)

export type StatTileRole = NonNullable<
  VariantProps<typeof statTileVariants>['role']
>

export interface StatTileProps {
  label: string
  count: number
  role: StatTileRole
  selected?: boolean
  tooltip?: string
  onClick: () => void
}

export const StatTile = ({
  label,
  count,
  role,
  selected = false,
  tooltip,
  onClick,
}: StatTileProps) => {
  const button = (
    <button
      type="button"
      className={cn(statTileVariants({ role, selected }))}
      aria-pressed={selected}
      aria-label={tooltip ? `${label}, ${tooltip}` : undefined}
      onClick={onClick}
    >
      <p className="mb-0.5 text-[11px] leading-none">{label}</p>
      <p className="text-lg leading-none font-medium">{count}</p>
    </button>
  )

  if (!tooltip) {
    return button
  }

  return (
    <Tooltip delayDuration={STAT_TILE_TOOLTIP_DELAY_MS}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="top"
        className={cn(
          'fill-mode-backwards zoom-in-100 data-[side=top]:slide-in-from-bottom-0 data-[state=closed]:zoom-out-100 ease-in-out',
          STAT_TILE_TOOLTIP_FADE_CLASS,
        )}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
