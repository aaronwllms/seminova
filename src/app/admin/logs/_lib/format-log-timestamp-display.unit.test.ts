import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { formatLogTimestampDisplay } from './format-log-timestamp-display'

describe('formatLogTimestampDisplay', () => {
  const originalTz = process.env.TZ

  beforeEach(() => {
    process.env.TZ = 'America/New_York'
  })

  afterEach(() => {
    process.env.TZ = originalTz
  })

  it('should omit the year and include milliseconds in local time', () => {
    const result = formatLogTimestampDisplay('2026-07-18T14:32:07.412Z')

    expect(result).toBe('Jul 18, 10:32:07 AM.412')
    expect(result).toMatch(/^Jul 18, .+\.412$/)
    expect(result).not.toContain('2026')
  })

  it('should return an em dash for missing or invalid values', () => {
    expect(formatLogTimestampDisplay(null)).toBe('—')
    expect(formatLogTimestampDisplay(undefined)).toBe('—')
    expect(formatLogTimestampDisplay('not-a-date')).toBe('—')
  })
})
