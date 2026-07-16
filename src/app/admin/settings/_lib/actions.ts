'use server'

import { revalidateTag } from 'next/cache'

import { isAppSettingKey } from '@/config/app-settings-registry'
import { APP_SETTINGS_CACHE_TAG } from '@/constants/app-settings'
import { createClient } from '@/supabase/server'
import type { AppSettingKey, AppSettingValueMap } from '@/types/app-settings'
import {
  parseAppSettingValue,
  saveAppSettingInputSchema,
} from '@/utils/app-settings-schema'

import {
  assertAdminCaller,
  type UsersActionError,
} from '../../users/_lib/assert-admin-caller'

type SaveAppSettingActionSuccess<K extends AppSettingKey = AppSettingKey> = {
  success: true
  data: {
    key: K
    value: AppSettingValueMap[K]
  }
}

export type SaveAppSettingActionResult<
  K extends AppSettingKey = AppSettingKey,
> = SaveAppSettingActionSuccess<K> | UsersActionError

export const saveAppSettingAction = async (
  input: unknown,
): Promise<SaveAppSettingActionResult> => {
  const callerResult = await assertAdminCaller()

  if (!callerResult.success) {
    return callerResult
  }

  const parsedInput = saveAppSettingInputSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      success: false,
      error: {
        message: parsedInput.error.issues[0]?.message ?? 'Invalid input',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  const { key, value } = parsedInput.data

  if (!isAppSettingKey(key)) {
    return {
      success: false,
      error: {
        message: 'Unknown setting',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  const parsedValue = parseAppSettingValue(key, value)

  if (!parsedValue.success) {
    return {
      success: false,
      error: {
        message: parsedValue.message,
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('app_settings').upsert({
    key,
    value: parsedValue.value,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error('[save-app-setting] Upsert failed', {
      key,
      supabaseCode: error.code,
    })

    return {
      success: false,
      error: {
        message: 'Could not save setting. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    }
  }

  revalidateTag(APP_SETTINGS_CACHE_TAG, 'max')

  return {
    success: true,
    data: {
      key,
      value: parsedValue.value,
    },
  }
}
