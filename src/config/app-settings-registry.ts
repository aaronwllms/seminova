import type {
  AppSettingValueByType,
  AppSettingValueType,
  LogLevel,
} from '@/types/app-settings'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'

export const APP_SETTINGS_GROUP_LOGGING = 'Logging' as const
export const APP_SETTINGS_GROUP_BANNERS = 'Banners' as const

const LOG_LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export const logLevelRank = (level: LogLevel): number => LOG_LEVEL_RANK[level]

type AppSettingRegistryEntryBase = {
  readonly key: string
  readonly label: string
  readonly description: string
  readonly valueType: AppSettingValueType
  readonly default: unknown
  readonly group: string
}

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
] as const satisfies readonly AppSettingRegistryEntryBase[]

export type AppSettingKey = (typeof APP_SETTINGS_REGISTRY)[number]['key']

export type AppSettingValueMap = {
  [Entry in (typeof APP_SETTINGS_REGISTRY)[number] as Entry['key']]: AppSettingValueByType[Entry['valueType']]
}

export type ResolvedAppSettings = AppSettingValueMap

export type AppSettingRegistryEntry = (typeof APP_SETTINGS_REGISTRY)[number]

export type AppSettingRegistryEntryFor<K extends AppSettingKey> = Extract<
  AppSettingRegistryEntry,
  { readonly key: K }
>

type AssertRegistryDefaults = {
  [Entry in (typeof APP_SETTINGS_REGISTRY)[number] as Entry['key']]: Entry['default'] extends AppSettingValueByType[Entry['valueType']]
    ? true
    : 'Registry default does not match valueType'
}

type RegistryDefaultsValid =
  AssertRegistryDefaults[keyof AssertRegistryDefaults] extends true
    ? true
    : 'Registry default type mismatch'

const registryDefaultsValid: RegistryDefaultsValid = true
void registryDefaultsValid

const registryByKey = new Map<AppSettingKey, AppSettingRegistryEntry>(
  APP_SETTINGS_REGISTRY.map((entry) => [entry.key, entry]),
)

export const isAppSettingKey = (key: string): key is AppSettingKey =>
  registryByKey.has(key as AppSettingKey)

export const getRegistryEntry = <K extends AppSettingKey>(
  key: K,
): AppSettingRegistryEntryFor<K> => {
  const entry = registryByKey.get(key)

  if (!entry) {
    throw new Error(`Unknown app setting key: ${key}`)
  }

  return entry as AppSettingRegistryEntryFor<K>
}
