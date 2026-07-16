export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

export type AppSettingKey = 'min_log_level' | 'log_retention_days'

export type AppSettingValueType = 'log_level' | 'positive_int'

export type AppSettingValueMap = {
  min_log_level: LogLevel
  log_retention_days: number
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
