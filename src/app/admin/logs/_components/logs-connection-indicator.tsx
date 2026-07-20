import type { AdminLogsConnectionState } from '../_lib/use-admin-logs-realtime'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/tailwind'

interface LogsConnectionIndicatorProps {
  connectionState: AdminLogsConnectionState
  className?: string
}

const CONNECTION_LABELS: Record<AdminLogsConnectionState, string> = {
  live: 'Live',
  reconnecting: 'Reconnecting',
  offline: 'Offline',
}

export const LogsConnectionIndicator = ({
  connectionState,
  className,
}: LogsConnectionIndicatorProps) => {
  if (connectionState === 'live') {
    return (
      <Badge
        variant="outline"
        aria-live="polite"
        className={cn(
          'border-success bg-success/15 text-success gap-1.5',
          className,
        )}
      >
        <span
          className="bg-success size-1.5 animate-pulse rounded-full"
          aria-hidden
        />
        {CONNECTION_LABELS[connectionState]}
      </Badge>
    )
  }

  if (connectionState === 'reconnecting') {
    return (
      <Badge
        variant="outline"
        aria-live="polite"
        className={cn('border-warning bg-warning/15 text-warning', className)}
      >
        {CONNECTION_LABELS[connectionState]}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      aria-live="polite"
      className={cn(
        'border-border bg-muted/50 text-muted-foreground',
        className,
      )}
    >
      {CONNECTION_LABELS[connectionState]}
    </Badge>
  )
}
