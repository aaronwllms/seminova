import { z } from 'zod'

import {
  getRegistryEntry,
  isAppSettingKey,
  type AppSettingKey,
  type AppSettingValueMap,
} from '@/config/app-settings-registry'
import { LOG_LEVELS } from '@/types/app-settings'
import { parseBannerSettingValue } from '@/utils/banner-settings-schema'

export const logLevelSchema = z.enum(LOG_LEVELS)

export const positiveIntSchema = z
  .number()
  .int('Must be a whole number')
  .positive('Must be greater than zero')

/** Client form field — string input coerced through the shared positiveIntSchema. */
export const positiveIntFormValueSchema = z
  .string()
  .transform((val) => Number(val))
  .pipe(positiveIntSchema)

export const appSettingLogLevelFormSchema = z.object({
  value: logLevelSchema,
})

export const appSettingPositiveIntFormSchema = z.object({
  value: z.string().superRefine((val, ctx) => {
    const parsed = positiveIntFormValueSchema.safeParse(val)

    if (!parsed.success) {
      ctx.addIssue({
        code: 'custom',
        message: parsed.error.issues[0]?.message ?? 'Invalid value',
      })
    }
  }),
})

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

  if (entry.valueType === 'banner') {
    const parsed = parseBannerSettingValue(raw)

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? 'Invalid banner settings',
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
