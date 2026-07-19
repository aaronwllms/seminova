'use client'

import { toClientLogTag, type ClientLogKey } from '@/config/client-log-registry'
import { CLIENT_LOGS_RELAY_PATH } from '@/constants/app-paths'
import type { LogLevel } from '@/types/app-settings'
import { mirrorLogToConsole } from '@/utils/app-log-console'

const flattenLogContext = (context?: unknown): unknown => {
  if (context === undefined) {
    return undefined
  }

  if (context instanceof Error) {
    const flattened: Record<string, unknown> = {
      name: context.name,
      message: context.message,
      stack: context.stack,
    }

    if (
      'digest' in context &&
      typeof (context as Error & { digest?: string }).digest === 'string'
    ) {
      flattened.digest = (context as Error & { digest?: string }).digest
    }

    return flattened
  }

  return context
}

const relayClientLog = (
  level: LogLevel,
  key: ClientLogKey,
  message: string,
  context?: unknown,
): void => {
  void fetch(CLIENT_LOGS_RELAY_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key,
      level,
      message,
      context: flattenLogContext(context),
    }),
    keepalive: true,
  }).catch(() => {
    // Fire-and-forget — relay failures never surface to the caller.
  })
}

const logAtLevel = (
  level: LogLevel,
  key: ClientLogKey,
  message: string,
  context?: unknown,
): void => {
  const tag = toClientLogTag(key)
  const normalizedContext = flattenLogContext(context)

  mirrorLogToConsole(level, tag, message, normalizedContext)
  relayClientLog(level, key, message, normalizedContext)
}

export const clientLog = Object.freeze({
  debug: (key: ClientLogKey, message: string, context?: unknown): void =>
    logAtLevel('debug', key, message, context),
  info: (key: ClientLogKey, message: string, context?: unknown): void =>
    logAtLevel('info', key, message, context),
  warn: (key: ClientLogKey, message: string, context?: unknown): void =>
    logAtLevel('warn', key, message, context),
  error: (key: ClientLogKey, message: string, context?: unknown): void =>
    logAtLevel('error', key, message, context),
})
