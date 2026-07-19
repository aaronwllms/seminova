import { describe, expect, it } from 'vitest'

import {
  datetimeLocalToIso,
  isoToDatetimeLocalValue,
} from './banner-datetime-local'

describe('banner datetime-local helpers', () => {
  it('should return empty string for null ISO input', () => {
    expect(isoToDatetimeLocalValue(null)).toBe('')
  })

  it('should return null for empty datetime-local input', () => {
    expect(datetimeLocalToIso('')).toBeNull()
    expect(datetimeLocalToIso('   ')).toBeNull()
  })

  it('should round-trip through local datetime-local formatting', () => {
    const iso = '2026-07-26T15:30:00.000Z'
    const localValue = isoToDatetimeLocalValue(iso)
    const roundTripped = datetimeLocalToIso(localValue)

    expect(localValue).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    expect(roundTripped).toBe(iso)
  })
})
