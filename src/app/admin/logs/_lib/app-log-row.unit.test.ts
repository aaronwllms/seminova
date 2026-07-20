import { describe, expect, it } from 'vitest'

import { mapAppLogRow } from './app-log-row'

describe('mapAppLogRow', () => {
  const baseRow = {
    id: 1,
    level: 'info',
    tag: 'settings-read',
    message: 'Cache hit',
    context: null,
    created_at: '2026-07-18T14:32:07.412Z',
    read_at: null,
  }

  it('should fall back unknown level values to info', () => {
    const result = mapAppLogRow({ ...baseRow, level: 'unknown' })

    expect(result.level).toBe('info')
  })

  it('should set isUnread to true when read_at is null', () => {
    const result = mapAppLogRow({ ...baseRow, read_at: null })

    expect(result.isUnread).toBe(true)
  })

  it('should set isUnread to false when read_at is set', () => {
    const result = mapAppLogRow({
      ...baseRow,
      read_at: '2026-07-18T15:00:00.000Z',
    })

    expect(result.isUnread).toBe(false)
  })
})
