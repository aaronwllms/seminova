import type { AppLogContext } from '@/types/app-logs'
import { LOG_LEVELS, type LogLevel } from '@/types/app-settings'

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
  read_at: string | null
}

export interface AppLogRow {
  id: number
  level: LogLevel
  tag: string
  message: string
  context: AppLogContext
  createdAt: string
  readAt: string | null
  isUnread: boolean
}

export const isLogLevel = (value: string): value is LogLevel =>
  (LOG_LEVELS as readonly string[]).includes(value)

export const mapAppLogRow = (row: AppLogDbRow): AppLogRow => ({
  id: row.id,
  level: isLogLevel(row.level) ? row.level : 'info',
  tag: row.tag,
  message: row.message,
  context: row.context,
  createdAt: row.created_at,
  readAt: row.read_at,
  isUnread: row.read_at === null,
})
