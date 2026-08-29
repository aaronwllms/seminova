import { describe, expect, it } from 'vitest'

import {
  APP_SETTINGS_GROUP_BANNERS,
  APP_SETTINGS_REGISTRY,
} from '@/config/app-settings-registry'

import {
  BANNER_REGISTRY_ENTRIES,
  GROUPED_NON_BANNER_REGISTRY_ENTRIES,
} from './app-settings-partition'

describe('app-settings-partition', () => {
  it('should place every registry key in exactly one export', () => {
    const groupedKeys = [
      ...GROUPED_NON_BANNER_REGISTRY_ENTRIES.values(),
    ].flatMap((entries) => entries.map((entry) => entry.key))
    const bannerKeys = BANNER_REGISTRY_ENTRIES.map((entry) => entry.key)
    const partitionedKeys = [...groupedKeys, ...bannerKeys].sort()
    const registryKeys = APP_SETTINGS_REGISTRY.map((entry) => entry.key).sort()

    expect(partitionedKeys).toEqual(registryKeys)
    expect(new Set(partitionedKeys).size).toBe(registryKeys.length)
  })

  it('should omit the Banners group from the non-banner map', () => {
    expect(
      GROUPED_NON_BANNER_REGISTRY_ENTRIES.has(APP_SETTINGS_GROUP_BANNERS),
    ).toBe(false)
  })

  it('should keep valueType and group aligned for banner vs non-banner entries', () => {
    for (const entry of BANNER_REGISTRY_ENTRIES) {
      expect(entry.group).toBe(APP_SETTINGS_GROUP_BANNERS)
    }

    for (const entries of GROUPED_NON_BANNER_REGISTRY_ENTRIES.values()) {
      for (const entry of entries) {
        expect(entry.group).not.toBe(APP_SETTINGS_GROUP_BANNERS)
        expect(entry.valueType).not.toBe('banner')
      }
    }
  })
})
