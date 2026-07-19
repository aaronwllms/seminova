import type { BannerSettingValue } from '@/types/banner'

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

export type AppSettingKey =
  | 'min_log_level'
  | 'log_retention_days'
  | 'banner_public'
  | 'banner_authenticated'

export type AppSettingValueType = 'log_level' | 'positive_int' | 'banner'

export type AppSettingValueMap = {
  min_log_level: LogLevel
  log_retention_days: number
  banner_public: BannerSettingValue
  banner_authenticated: BannerSettingValue
}

export type ResolvedAppSettings = AppSettingValueMap

export interface AppSettingRegistryEntry<
  K extends AppSettingKey = AppSettingKey,
> {
  key: K
  label: string
  description: string
  valueType: AppSettingValueType
  default: AppSettingValueMap[K]
  group: string
}
