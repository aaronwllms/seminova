import type {
  AppSettingKey,
  AppSettingRegistryEntry,
  LogLevel,
} from '@/types/app-settings'
import { LOG_LEVELS } from '@/types/app-settings'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'

export const APP_SETTINGS_GROUP_LOGGING = 'Logging' as const
export const APP_SETTINGS_GROUP_BANNERS = 'Banners' as const

export { LOG_LEVELS }

const LOG_LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export const logLevelRank = (level: LogLevel): number => LOG_LEVEL_RANK[level]

// debt: AppSettingKey / AppSettingValueMap in src/types/app-settings.ts and APP_SETTINGS_REGISTRY here are kept in sync by hand. Upgrade path: derive the key union and value map from the registry const so a new entry cannot compile without its types.
export const APP_SETTINGS_REGISTRY = [
  {
    key: 'min_log_level',
    label: 'Minimum log level',
    description:
      'Logs below this level are neither printed nor persisted. Lower it to debug when investigating; raise it to quiet a noisy deployment.',
    valueType: 'log_level',
    default: 'info',
    group: APP_SETTINGS_GROUP_LOGGING,
  },
  {
    key: 'log_retention_days',
    label: 'Log retention window',
    description:
      'Days a log row is kept before the scheduled purge deletes it.',
    valueType: 'positive_int',
    default: 30,
    group: APP_SETTINGS_GROUP_LOGGING,
  },
  {
    key: 'banner_public',
    label: 'Public banner',
    description: 'Shown on the marketing page.',
    valueType: 'banner',
    default: DEFAULT_BANNER_SETTING,
    group: APP_SETTINGS_GROUP_BANNERS,
  },
  {
    key: 'banner_authenticated',
    label: 'Authenticated banner',
    description: 'Shown in the app shell to signed-in users.',
    valueType: 'banner',
    default: DEFAULT_BANNER_SETTING,
    group: APP_SETTINGS_GROUP_BANNERS,
  },
] as const satisfies readonly AppSettingRegistryEntry[]

const registryByKey = new Map<AppSettingKey, AppSettingRegistryEntry>(
  APP_SETTINGS_REGISTRY.map((entry) => [entry.key, entry]),
)

export const isAppSettingKey = (key: string): key is AppSettingKey =>
  registryByKey.has(key as AppSettingKey)

export const getRegistryEntry = (
  key: AppSettingKey,
): AppSettingRegistryEntry => {
  const entry = registryByKey.get(key)

  if (!entry) {
    throw new Error(`Unknown app setting key: ${key}`)
  }

  return entry
}
