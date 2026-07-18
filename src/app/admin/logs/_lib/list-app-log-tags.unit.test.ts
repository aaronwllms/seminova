import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listAppLogTags } from './list-app-log-tags'

describe('listAppLogTags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return distinct tags in first-seen order', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        { tag: 'auth-session' },
        { tag: 'settings-read' },
        { tag: 'auth-session' },
        { tag: 'client-auth-form-error' },
      ],
      error: null,
    })
    const select = vi.fn().mockReturnValue({ order })
    const client = {
      from: vi.fn().mockReturnValue({ select }),
    } as unknown as SupabaseClient

    const tags = await listAppLogTags(client)

    expect(tags).toEqual([
      'auth-session',
      'settings-read',
      'client-auth-form-error',
    ])
    expect(client.from).toHaveBeenCalledWith('app_logs')
    expect(select).toHaveBeenCalledWith('tag')
    expect(order).toHaveBeenCalledWith('tag', { ascending: true })
  })

  it('should throw when the query fails', async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('db down'),
    })
    const select = vi.fn().mockReturnValue({ order })
    const client = {
      from: vi.fn().mockReturnValue({ select }),
    } as unknown as SupabaseClient

    await expect(listAppLogTags(client)).rejects.toThrow('db down')
  })
})
