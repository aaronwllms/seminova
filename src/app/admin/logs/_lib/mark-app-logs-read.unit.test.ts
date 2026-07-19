import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EMPTY_LOG_LIST_FILTERS } from './log-list-filters'
import {
  countFilteredUnreadLogs,
  markAllLogsRead,
  markLogRead,
  markLogUnread,
} from './mark-app-logs-read'

const createFilterableChain = (
  terminalResponse:
    | { data: { id: number }[] | null; error: Error | null }
    | { count: number | null; error: Error | null },
) => {
  const chain = {
    in: vi.fn(),
    is: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
    select: vi.fn(),
    then: (
      onFulfilled: (
        value:
          | { data: { id: number }[] | null; error: Error | null }
          | { count: number | null; error: Error | null },
      ) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(terminalResponse).then(onFulfilled, onRejected),
  }

  chain.in.mockReturnValue(chain)
  chain.is.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.or.mockReturnValue(chain)
  chain.select.mockReturnValue(chain)

  return chain
}

describe('mark-app-logs-read', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update read_at for a single log row', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    const client = {
      from: vi.fn().mockReturnValue({ update }),
    } as unknown as SupabaseClient

    await markLogRead(client, 42)

    expect(client.from).toHaveBeenCalledWith('app_logs')
    expect(update).toHaveBeenCalledWith({ read_at: expect.any(String) })
    expect(eq).toHaveBeenCalledWith('id', 42)
  })

  it('should clear read_at for a single log row', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    const client = {
      from: vi.fn().mockReturnValue({ update }),
    } as unknown as SupabaseClient

    await markLogUnread(client, 42)

    expect(client.from).toHaveBeenCalledWith('app_logs')
    expect(update).toHaveBeenCalledWith({ read_at: null })
    expect(eq).toHaveBeenCalledWith('id', 42)
  })

  it('should mark unread rows read using the shared filter set', async () => {
    const filteredChain = createFilterableChain({
      data: [{ id: 1 }, { id: 2 }],
      error: null,
    })
    const select = vi.fn().mockReturnValue(filteredChain)
    const is = vi.fn().mockReturnValue({ select })
    const update = vi.fn().mockReturnValue({ is })
    const client = {
      from: vi.fn().mockReturnValue({ update }),
    } as unknown as SupabaseClient

    const markedCount = await markAllLogsRead(client, {
      ...EMPTY_LOG_LIST_FILTERS,
      levels: ['error'],
      search: 'token',
    })

    expect(markedCount).toBe(2)
    expect(is).toHaveBeenCalledWith('read_at', null)
    expect(select).toHaveBeenCalledWith('id')
    expect(filteredChain.in).toHaveBeenCalledWith('level', ['error'])
    expect(filteredChain.or).toHaveBeenCalledWith(
      'message.ilike.%token%,tag.ilike.%token%,context_text.ilike.%token%',
    )
  })

  it('should count unread rows in the active filter view', async () => {
    const filteredChain = createFilterableChain({
      count: 4,
      error: null,
    })
    const select = vi.fn().mockReturnValue(filteredChain)
    const client = {
      from: vi.fn().mockReturnValue({ select }),
    } as unknown as SupabaseClient

    const count = await countFilteredUnreadLogs(client, {
      ...EMPTY_LOG_LIST_FILTERS,
      unreadOnly: true,
      tag: 'auth-session',
    })

    expect(count).toBe(4)
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true })
    expect(filteredChain.is).toHaveBeenCalledWith('read_at', null)
    expect(filteredChain.eq).toHaveBeenCalledWith('tag', 'auth-session')
  })
})
