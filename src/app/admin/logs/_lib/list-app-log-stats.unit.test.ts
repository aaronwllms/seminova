import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LogLevel } from '@/types/app-settings'

import { listAppLogStats } from './list-app-log-stats'

const createTerminalQuery = (response: {
  count: number | null
  error: Error | null
}) => ({
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  then: (
    onFulfilled: (value: {
      count: number | null
      error: Error | null
    }) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => {
    if (response.error) {
      return Promise.reject(response.error).catch(onRejected)
    }

    return Promise.resolve(response).then(onFulfilled, onRejected)
  },
})

const createStatsClientMock = (counts: {
  total: number
  unread: number
  debug: number
  info: number
  warn: number
  error: number
}) => {
  const levelCounts: Record<LogLevel, number> = {
    debug: counts.debug,
    info: counts.info,
    warn: counts.warn,
    error: counts.error,
  }

  const chain = {
    eq: vi.fn((column: string, value: string) => {
      if (column === 'level') {
        return createTerminalQuery({
          count: levelCounts[value as LogLevel] ?? 0,
          error: null,
        })
      }

      return createTerminalQuery({ count: 0, error: null })
    }),
    is: vi.fn(() =>
      createTerminalQuery({
        count: counts.unread,
        error: null,
      }),
    ),
    then: (
      onFulfilled: (value: {
        count: number | null
        error: Error | null
      }) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) =>
      Promise.resolve({ count: counts.total, error: null }).then(
        onFulfilled,
        onRejected,
      ),
  }

  const select = vi.fn().mockReturnValue(chain)
  const client = {
    from: vi.fn().mockReturnValue({ select }),
  } as unknown as SupabaseClient

  return { client, select }
}

describe('listAppLogStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return global counts for each level and unread rows', async () => {
    const { client } = createStatsClientMock({
      total: 12,
      unread: 3,
      debug: 1,
      info: 4,
      warn: 2,
      error: 5,
    })

    const stats = await listAppLogStats(client)

    expect(stats).toEqual({
      total: 12,
      debug: 1,
      info: 4,
      warn: 2,
      error: 5,
      unread: 3,
    })
    expect(client.from).toHaveBeenCalledWith('app_logs')
  })

  it('should throw when a count query fails', async () => {
    const chain = createTerminalQuery({
      count: null,
      error: new Error('db down'),
    })
    const select = vi.fn().mockReturnValue(chain)
    const client = {
      from: vi.fn().mockReturnValue({ select }),
    } as unknown as SupabaseClient

    await expect(listAppLogStats(client)).rejects.toThrow('db down')
  })
})
