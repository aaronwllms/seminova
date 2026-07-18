import type { AppLogContext } from '@/types/app-logs'
import type { LogLevel } from '@/types/app-settings'

export interface BuildLogRowCopyTextParams {
  createdAt: string
  level: LogLevel
  tag: string
  message: string
  context: AppLogContext
}

export const buildLogRowCopyText = ({
  createdAt,
  level,
  tag,
  message,
  context,
}: BuildLogRowCopyTextParams): string => {
  const payload: Record<string, unknown> = {
    timestamp: createdAt,
    level,
    tag,
    message,
  }

  if (context !== null) {
    payload.context = context
  }

  return JSON.stringify(payload, null, 2)
}
