import { describe, expect, it } from 'vitest'

import { formatLogTimestamp } from './app-log-row'

describe('formatLogTimestamp', () => {
  it('should omit the year and include milliseconds', () => {
    const result = formatLogTimestamp('2026-07-18T14:32:07.412Z')

    expect(result).toMatch(/^Jul 18, .+\.412$/)
    expect(result).not.toContain('2026')
  })

  it('should return an em dash for missing or invalid values', () => {
    expect(formatLogTimestamp(null)).toBe('—')
    expect(formatLogTimestamp(undefined)).toBe('—')
    expect(formatLogTimestamp('not-a-date')).toBe('—')
  })
})
