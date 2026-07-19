import type { LogLevel } from '@/types/app-settings'

const CONSOLE_BY_LEVEL: Record<
  LogLevel,
  (message?: unknown, ...optionalParams: unknown[]) => void
> = {
  debug: console.debug.bind(console),
  info: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
}

export const mirrorLogToConsole = (
  level: LogLevel,
  tag: string,
  message: string,
  context?: unknown,
): void => {
  const consoleFn = CONSOLE_BY_LEVEL[level]
  const formattedMessage = `[${tag}] ${message}`

  if (context !== undefined) {
    consoleFn(formattedMessage, context)
  } else {
    consoleFn(formattedMessage)
  }
}
