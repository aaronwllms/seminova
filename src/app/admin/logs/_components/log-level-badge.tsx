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
      <Badge variant="destructive" className={className}>
        {LEVEL_LABELS[level]}
      </Badge>
    )
  }

  if (level === 'warn') {
    return (
      <Badge
        className={cn(
          'bg-warning text-warning-foreground border-transparent',
          className,
        )}
      >
        {LEVEL_LABELS[level]}
      </Badge>
    )
  }

  if (level === 'debug') {
    return (
      <Badge variant="outline" className={className}>
        {LEVEL_LABELS[level]}
      </Badge>
    )
  }

  return (
    <Badge variant="default" className={className}>
      {LEVEL_LABELS[level]}
    </Badge>
  )
}
