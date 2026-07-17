import type { LogLevel } from '@/types/app-settings'

export type { LogLevel } from '@/types/app-settings'

export type AppLogContext = Record<string, unknown> | null

export interface AppLogInsert {
  level: LogLevel
  tag: string
  message: string
  context: AppLogContext
}
