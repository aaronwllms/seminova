'use client'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/tailwind'

const statTileVariants = cva(
  'cursor-pointer rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      role: {
        total: 'bg-card text-muted-foreground border-[0.5px] border-border',
        debug: 'bg-muted/50 text-muted-foreground border-[0.5px] border-border',
        info: 'bg-accent/40 text-accent-foreground border-[0.5px] border-accent',
        warn: 'bg-warning/15 text-warning-foreground border-[0.5px] border-warning',
        error:
          'bg-destructive/10 text-destructive border-[0.5px] border-destructive',
        unread: 'bg-chart-1/10 text-chart-1 border-[0.5px] border-chart-1',
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
        className: 'border-2 border-accent',
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
        className: 'border-2 border-chart-1',
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
  onClick: () => void
}

export const StatTile = ({
  label,
  count,
  role,
  selected = false,
  onClick,
}: StatTileProps) => (
  <button
    type="button"
    className={cn(statTileVariants({ role, selected }))}
    aria-pressed={selected}
    onClick={onClick}
  >
    <p className="mb-0.5 text-[11px] leading-none">{label}</p>
    <p className="text-lg leading-none font-medium">{count}</p>
  </button>
)
