import type { AppLogContext } from '@/types/app-logs'
import type { LogLevel } from '@/types/app-settings'
import { buildStructuredCopyText } from '@/utils/build-structured-copy-text'

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
}: BuildLogRowCopyTextParams): string =>
  buildStructuredCopyText({
    timestamp: createdAt,
    level,
    tag,
    message,
    context,
  })
