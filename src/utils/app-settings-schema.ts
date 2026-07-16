import { z } from 'zod'

import {
  getRegistryEntry,
  isAppSettingKey,
} from '@/config/app-settings-registry'
import type { AppSettingKey, AppSettingValueMap } from '@/types/app-settings'
import { LOG_LEVELS } from '@/types/app-settings'

const logLevelSchema = z.enum(LOG_LEVELS)

const positiveIntSchema = z
  .number()
  .int('Must be a whole number')
  .positive('Must be greater than zero')

export type ParseAppSettingValueResult<K extends AppSettingKey> =
  | { success: true; value: AppSettingValueMap[K] }
  | { success: false; message: string }

export const parseAppSettingValue = <K extends AppSettingKey>(
  key: K,
  raw: unknown,
): ParseAppSettingValueResult<K> => {
  if (!isAppSettingKey(key)) {
    return { success: false, message: 'Unknown setting' }
  }

  const entry = getRegistryEntry(key)

  if (entry.valueType === 'log_level') {
    const parsed = logLevelSchema.safeParse(raw)

    if (!parsed.success) {
      return {
        success: false,
        message: 'Choose a valid log level',
      }
    }

    return { success: true, value: parsed.data as AppSettingValueMap[K] }
  }

  const parsed = positiveIntSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid value',
    }
  }

  return { success: true, value: parsed.data as AppSettingValueMap[K] }
}

export const saveAppSettingInputSchema = z.object({
  key: z.string().refine(isAppSettingKey, 'Unknown setting'),
  value: z.unknown(),
})
