import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  LOGS_LIVE_ENABLED_STORAGE_KEY,
  readLogsLiveEnabledPreference,
  writeLogsLiveEnabledPreference,
} from './logs-live-preference'

describe('readLogsLiveEnabledPreference', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('should return false when the key is missing', () => {
    expect(readLogsLiveEnabledPreference()).toBe(false)
  })

  it('should return true only for stored "true"', () => {
    localStorage.setItem(LOGS_LIVE_ENABLED_STORAGE_KEY, 'true')
    expect(readLogsLiveEnabledPreference()).toBe(true)
  })

  it('should return false for stored "false"', () => {
    localStorage.setItem(LOGS_LIVE_ENABLED_STORAGE_KEY, 'false')
    expect(readLogsLiveEnabledPreference()).toBe(false)
  })

  it('should treat invalid stored values as false', () => {
    localStorage.setItem(LOGS_LIVE_ENABLED_STORAGE_KEY, 'yes')
    expect(readLogsLiveEnabledPreference()).toBe(false)
  })

  it('should return false when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

    expect(readLogsLiveEnabledPreference()).toBe(false)
  })

  it('should return false on SSR without reading storage', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
    const windowDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'window',
    )

    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
    })

    expect(readLogsLiveEnabledPreference()).toBe(false)
    expect(getItemSpy).not.toHaveBeenCalled()

    if (windowDescriptor) {
      Object.defineProperty(globalThis, 'window', windowDescriptor)
    }
  })
})

describe('writeLogsLiveEnabledPreference', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('should persist true and false values', () => {
    writeLogsLiveEnabledPreference(true)
    expect(localStorage.getItem(LOGS_LIVE_ENABLED_STORAGE_KEY)).toBe('true')

    writeLogsLiveEnabledPreference(false)
    expect(localStorage.getItem(LOGS_LIVE_ENABLED_STORAGE_KEY)).toBe('false')
  })

  it('should fail silently when setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

    expect(() => writeLogsLiveEnabledPreference(true)).not.toThrow()
  })

  it('should no-op on SSR without writing storage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    const windowDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'window',
    )

    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
    })

    writeLogsLiveEnabledPreference(true)
    expect(setItemSpy).not.toHaveBeenCalled()

    if (windowDescriptor) {
      Object.defineProperty(globalThis, 'window', windowDescriptor)
    }
  })
})
