import type { AppLogContext } from '@/types/app-logs'
import type { LogLevel } from '@/types/app-settings'

export const LOGS_SORT_DIRECTIONS = ['asc', 'desc'] as const

export type LogsSortDirection = (typeof LOGS_SORT_DIRECTIONS)[number]

export interface AppLogCursor {
  createdAt: string
  id: number
}

export interface AppLogDbRow {
  id: number
  level: string
  tag: string
  message: string
  context: AppLogContext
  created_at: string
}

export interface AppLogRow {
  id: number
  level: LogLevel
  tag: string
  message: string
  context: AppLogContext
  createdAt: string
  timestampLabel: string
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'medium',
})

export const formatLogTimestamp = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const ms = String(date.getMilliseconds()).padStart(3, '0')

  return `${dateFormatter.format(date)}.${ms}`
}

const isLogLevel = (value: string): value is LogLevel =>
  value === 'debug' || value === 'info' || value === 'warn' || value === 'error'

export const mapAppLogRow = (row: AppLogDbRow): AppLogRow => ({
  id: row.id,
  level: isLogLevel(row.level) ? row.level : 'info',
  tag: row.tag,
  message: row.message,
  context: row.context,
  createdAt: row.created_at,
  timestampLabel: formatLogTimestamp(row.created_at),
})
