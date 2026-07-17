import { logLevelRank } from '@/config/app-settings-registry'
import type { LogLevel } from '@/types/app-settings'
import { resolveAppSettings } from '@/utils/app-settings'
import { normalizeLogContext, persistAppLogRow } from '@/utils/persist-app-log'

const CONSOLE_BY_LEVEL: Record<
  LogLevel,
  (message?: unknown, ...optionalParams: unknown[]) => void
> = {
  debug: console.debug.bind(console),
  info: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
}

let cachedThreshold: LogLevel | undefined

const getThreshold = async (): Promise<LogLevel> => {
  if (cachedThreshold === undefined) {
    const settings = await resolveAppSettings()
    cachedThreshold = settings.min_log_level
  }

  return cachedThreshold
}

const logAtLevel = async (
  level: LogLevel,
  tag: string,
  message: string,
  context?: unknown,
): Promise<void> => {
  const threshold = await getThreshold()

  if (logLevelRank(level) < logLevelRank(threshold)) {
    return
  }

  const consoleFn = CONSOLE_BY_LEVEL[level]
  const formattedMessage = `[${tag}] ${message}`

  if (context !== undefined) {
    consoleFn(formattedMessage, context)
  } else {
    consoleFn(formattedMessage)
  }

  await persistAppLogRow({
    level,
    tag,
    message,
    context: normalizeLogContext(context),
  })
}

export const cliLog = Object.freeze({
  debug: (tag: string, message: string, context?: unknown): Promise<void> =>
    logAtLevel('debug', tag, message, context),
  info: (tag: string, message: string, context?: unknown): Promise<void> =>
    logAtLevel('info', tag, message, context),
  warn: (tag: string, message: string, context?: unknown): Promise<void> =>
    logAtLevel('warn', tag, message, context),
  error: (tag: string, message: string, context?: unknown): Promise<void> =>
    logAtLevel('error', tag, message, context),
})
