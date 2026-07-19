import { describe, expect, it } from 'vitest'

import { ADMIN_LOGS, ADMIN_SETTINGS } from '@/constants/admin-paths'

import {
  resetAdminSettingsVisitKeyForTests,
  syncAdminSettingsVisitKey,
} from './admin-settings-visit-key'

describe('syncAdminSettingsVisitKey', () => {
  it('should bump the visit key when pathname transitions onto settings', () => {
    resetAdminSettingsVisitKeyForTests()

    expect(syncAdminSettingsVisitKey(ADMIN_SETTINGS)).toBe(1)
    expect(syncAdminSettingsVisitKey(ADMIN_LOGS)).toBe(1)
    expect(syncAdminSettingsVisitKey(ADMIN_SETTINGS)).toBe(2)
  })

  it('should not bump the visit key while pathname stays on settings', () => {
    resetAdminSettingsVisitKeyForTests()

    expect(syncAdminSettingsVisitKey(ADMIN_SETTINGS)).toBe(1)
    expect(syncAdminSettingsVisitKey(ADMIN_SETTINGS)).toBe(1)
  })
})
