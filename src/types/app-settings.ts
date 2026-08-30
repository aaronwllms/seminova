import type { BannerSettingValue } from '@/types/banner'

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

export type AppSettingValueType = 'log_level' | 'positive_int' | 'banner'

export type AppSettingValueByType = {
  log_level: LogLevel
  positive_int: number
  banner: BannerSettingValue
}
