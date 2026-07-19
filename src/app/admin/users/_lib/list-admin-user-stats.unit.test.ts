import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listAdminUserStats } from './list-admin-user-stats'

const createClientMock = (
  row: {
    total: number
    unverified: number
    banned: number
  } | null,
) =>
  ({
    rpc: vi.fn().mockResolvedValue({
      data: row ? [row] : [],
      error: null,
    }),
  }) as unknown as SupabaseClient

describe('listAdminUserStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call admin_user_stats and map counts', async () => {
    const client = createClientMock({ total: 10, unverified: 2, banned: 1 })

    const result = await listAdminUserStats(client)

    expect(client.rpc).toHaveBeenCalledWith('admin_user_stats')
    expect(result).toEqual({ total: 10, unverified: 2, banned: 1 })
  })

  it('should default missing row values to zero', async () => {
    const client = createClientMock(null)

    const result = await listAdminUserStats(client)

    expect(result).toEqual({ total: 0, unverified: 0, banned: 0 })
  })
})
