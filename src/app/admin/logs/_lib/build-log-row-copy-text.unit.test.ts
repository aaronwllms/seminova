import { describe, expect, it } from 'vitest'

import { buildLogRowCopyText } from './build-log-row-copy-text'

describe('buildLogRowCopyText', () => {
  it('should emit pretty-printed JSON with context when present', () => {
    const output = buildLogRowCopyText({
      createdAt: '2026-07-18T14:32:07.412Z',
      level: 'error',
      tag: 'auth-session',
      message: 'Token refresh failed',
      context: {
        userId: 'abc123',
        reason: 'expired_refresh_token',
      },
    })

    const parsed = JSON.parse(output) as Record<string, unknown>

    expect(parsed.timestamp).toBe('2026-07-18T14:32:07.412Z')
    expect(parsed.level).toBe('error')
    expect(parsed.tag).toBe('auth-session')
    expect(parsed.message).toBe('Token refresh failed')
    expect(parsed.context).toEqual({
      userId: 'abc123',
      reason: 'expired_refresh_token',
    })
    expect(output).toContain('\n  "timestamp":')
  })

  it('should omit context when row context is null', () => {
    const output = buildLogRowCopyText({
      createdAt: '2026-07-18T14:32:07.412Z',
      level: 'info',
      tag: 'settings-read',
      message: 'Cache hit',
      context: null,
    })

    const parsed = JSON.parse(output) as Record<string, unknown>

    expect(parsed.timestamp).toBe('2026-07-18T14:32:07.412Z')
    expect(parsed.level).toBe('info')
    expect(parsed.tag).toBe('settings-read')
    expect(parsed.message).toBe('Cache hit')
    expect(parsed).not.toHaveProperty('context')
  })
})
