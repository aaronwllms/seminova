import { beforeEach, describe, expect, it, vi } from 'vitest'

import { APP_SETTINGS_CACHE_TAG } from '@/constants/app-settings'
import { ADMIN_ROLE } from '@/constants/admin-role'

const getUserMock = vi.fn()
const createClientMock = vi.fn()
const upsertMock = vi.fn()
const fromMock = vi.fn()
const revalidateTagMock = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: () => createClientMock(),
}))

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
}))

const adminUser = {
  id: 'admin-user-id',
  app_metadata: { role: ADMIN_ROLE },
}

describe('saveAppSettingAction', () => {
  beforeEach(() => {
    vi.resetModules()
    getUserMock.mockReset()
    createClientMock.mockReset()
    upsertMock.mockReset()
    fromMock.mockReset()
    revalidateTagMock.mockReset()

    fromMock.mockReturnValue({ upsert: upsertMock })
    createClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
      from: fromMock,
    })
    getUserMock.mockResolvedValue({
      data: { user: adminUser },
      error: null,
    })
    upsertMock.mockResolvedValue({ error: null })
  })

  it('should return FORBIDDEN when caller is not admin', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-1', app_metadata: {} } },
      error: null,
    })

    const { saveAppSettingAction } = await import('./actions')
    const result = await saveAppSettingAction({
      key: 'min_log_level',
      value: 'warn',
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Forbidden',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    })
  })

  it('should return VALIDATION_ERROR for unknown keys', async () => {
    const { saveAppSettingAction } = await import('./actions')
    const result = await saveAppSettingAction({
      key: 'unknown_setting',
      value: 'info',
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Unknown setting',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
  })

  it('should return VALIDATION_ERROR for invalid value shapes', async () => {
    const { saveAppSettingAction } = await import('./actions')
    const result = await saveAppSettingAction({
      key: 'log_retention_days',
      value: 0,
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Must be greater than zero',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
  })

  it('should upsert valid settings and revalidate the app-settings tag', async () => {
    const { saveAppSettingAction } = await import('./actions')
    const result = await saveAppSettingAction({
      key: 'min_log_level',
      value: 'warn',
    })

    expect(result).toEqual({
      success: true,
      data: {
        key: 'min_log_level',
        value: 'warn',
      },
    })
    expect(fromMock).toHaveBeenCalledWith('app_settings')
    expect(upsertMock).toHaveBeenCalledWith({
      key: 'min_log_level',
      value: 'warn',
      updated_at: expect.any(String),
    })
    expect(revalidateTagMock).toHaveBeenCalledWith(
      APP_SETTINGS_CACHE_TAG,
      'max',
    )
  })

  it('should return INTERNAL_ERROR fault when upsert fails', async () => {
    upsertMock.mockResolvedValue({
      error: { code: '23505', message: 'duplicate key value' },
    })

    const { saveAppSettingAction } = await import('./actions')
    const result = await saveAppSettingAction({
      key: 'min_log_level',
      value: 'warn',
    })

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Could not save setting. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })
  })
})
