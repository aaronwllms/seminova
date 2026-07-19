import type { LogLevel } from '@/types/app-settings'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/tailwind'

const LEVEL_LABELS: Record<LogLevel, string> = {
  error: 'Error',
  warn: 'Warn',
  info: 'Info',
  debug: 'Debug',
}

interface LogLevelBadgeProps {
  level: LogLevel
  className?: string
}

export const LogLevelBadge = ({ level, className }: LogLevelBadgeProps) => {
  if (level === 'error') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-destructive bg-destructive/10 text-destructive',
          className,
        )}
      >
        {LEVEL_LABELS[level]}
      </Badge>
    )
  }

  if (level === 'warn') {
    return (
      <Badge
        variant="outline"
        className={cn('border-warning bg-warning/15 text-warning', className)}
      >
        {LEVEL_LABELS[level]}
      </Badge>
    )
  }

  if (level === 'debug') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-border bg-muted/50 text-muted-foreground',
          className,
        )}
      >
        {LEVEL_LABELS[level]}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn('border-info bg-info/15 text-info', className)}
    >
      {LEVEL_LABELS[level]}
    </Badge>
  )
}
