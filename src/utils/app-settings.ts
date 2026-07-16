import { unstable_cache } from 'next/cache'

import { APP_SETTINGS_REGISTRY } from '@/config/app-settings-registry'
import { APP_SETTINGS_CACHE_TAG } from '@/constants/app-settings'
import { createServiceClient } from '@/supabase/service'
import type {
  AppSettingKey,
  AppSettingValueMap,
  ResolvedAppSettings,
} from '@/types/app-settings'
import { parseAppSettingValue } from '@/utils/app-settings-schema'

export { APP_SETTINGS_CACHE_TAG } from '@/constants/app-settings'

type AppSettingsRow = {
  key: string
  value: unknown
}

const fetchAppSettingsRows = async (): Promise<AppSettingsRow[]> => {
  const client = createServiceClient()
  const { data, error } = await client.from('app_settings').select('key, value')

  if (error) {
    throw error
  }

  return data ?? []
}

const mergeSettingValue = <K extends AppSettingKey>(
  key: K,
  raw: unknown,
): AppSettingValueMap[K] => {
  const parsed = parseAppSettingValue(key, raw)

  if (!parsed.success) {
    throw new Error(
      `[app-settings] Invalid stored value for ${key}: ${parsed.message}`,
    )
  }

  return parsed.value
}

const mergeRowsWithRegistry = (rows: AppSettingsRow[]): ResolvedAppSettings => {
  const rowByKey = new Map(rows.map((row) => [row.key, row.value]))

  return Object.fromEntries(
    APP_SETTINGS_REGISTRY.map((entry) => {
      const raw = rowByKey.has(entry.key)
        ? rowByKey.get(entry.key)
        : entry.default

      return [entry.key, mergeSettingValue(entry.key, raw)] as const
    }),
  ) as ResolvedAppSettings
}

export const resolveAppSettings = async (): Promise<ResolvedAppSettings> => {
  const rows = await fetchAppSettingsRows()
  return mergeRowsWithRegistry(rows)
}

export const getResolvedAppSettings = unstable_cache(
  resolveAppSettings,
  ['app-settings-snapshot'],
  { tags: [APP_SETTINGS_CACHE_TAG] },
)

export const getAppSetting = async <K extends AppSettingKey>(
  key: K,
): Promise<ResolvedAppSettings[K]> => {
  const settings = await getResolvedAppSettings()
  return settings[key]
}
