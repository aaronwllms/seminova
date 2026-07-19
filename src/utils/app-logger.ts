import 'server-only'

import { after } from 'next/server'

import { logLevelRank } from '@/config/app-settings-registry'
import type { LogLevel } from '@/types/app-settings'
import { getAppSetting } from '@/utils/app-settings'
import { mirrorLogToConsole } from '@/utils/app-log-console'
import { normalizeLogContext, persistAppLogRow } from '@/utils/persist-app-log'

const logAtLevel = (
  level: LogLevel,
  tag: string,
  message: string,
  context?: unknown,
): void => {
  after(async () => {
    const threshold = await getAppSetting('min_log_level')

    if (logLevelRank(level) < logLevelRank(threshold)) {
      return
    }

    mirrorLogToConsole(level, tag, message, context)

    await persistAppLogRow({
      level,
      tag,
      message,
      context: normalizeLogContext(context),
    })
  })
}

export const appLog = Object.freeze({
  debug: (tag: string, message: string, context?: unknown): void =>
    logAtLevel('debug', tag, message, context),
  info: (tag: string, message: string, context?: unknown): void =>
    logAtLevel('info', tag, message, context),
  warn: (tag: string, message: string, context?: unknown): void =>
    logAtLevel('warn', tag, message, context),
  error: (tag: string, message: string, context?: unknown): void =>
    logAtLevel('error', tag, message, context),
})
