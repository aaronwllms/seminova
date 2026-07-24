import * as React from 'react'

import { cn } from '@/utils/tailwind'

/** Non-interactive marketing info card — background tint on hover only. */
export const MarketingDisplayCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-card text-card-foreground hover:bg-muted/30 duration-dwell rounded-xl border p-5 transition-colors',
      className,
    )}
    {...props}
  />
))
MarketingDisplayCard.displayName = 'MarketingDisplayCard'
