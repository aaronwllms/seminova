import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DATA_TABLE_DEFAULT_PAGE_SIZE } from '@/constants/data-table'

import { type AppLogDbRow } from './app-log-row'
import { listAppLogsPage } from './list-app-logs'
import { EMPTY_LOG_LIST_FILTERS } from './log-list-filters'

const createDbRow = (id: number, createdAt: string): AppLogDbRow => ({
  id,
  level: 'info',
  tag: 'test-tag',
  message: `message-${id}`,
  context: null,
  created_at: createdAt,
  read_at: null,
})

type QueryBuilderMocks = {
  select: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
  is: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  or: ReturnType<typeof vi.fn>
  orderCreated: ReturnType<typeof vi.fn>
  orderId: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

const createClientMock = (rows: AppLogDbRow[]) => {
  const limit = vi.fn().mockResolvedValue({ data: rows, error: null })
  const orderId = vi.fn().mockReturnValue({ limit })
  const orderCreated = vi.fn().mockReturnValue({ order: orderId })
  const or = vi.fn()
  const eq = vi.fn()
  const is = vi.fn()
  const inFn = vi.fn()

  const chainable = () => ({ or, order: orderCreated, eq, in: inFn, is })

  or.mockImplementation(chainable)
  eq.mockImplementation(chainable)
  is.mockImplementation(chainable)
  inFn.mockImplementation(chainable)

  const select = vi.fn().mockImplementation(chainable)

  const client = {
    from: vi.fn().mockReturnValue({ select }),
  } as unknown as SupabaseClient

  const mocks: QueryBuilderMocks = {
    select,
    in: inFn,
    is,
    eq,
    or,
    orderCreated,
    orderId,
    limit,
  }

  return { client, mocks }
}

describe('listAppLogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return first page in desc order without a cursor filter', async () => {
    const rows = [createDbRow(2, '2026-07-18T14:32:07.412Z')]
    const { client, mocks } = createClientMock(rows)

    const result = await listAppLogsPage(client, { sortDirection: 'desc' })

    expect(result.rows).toHaveLength(1)
    expect(result.hasNextPage).toBe(false)
    expect(result.rows[0]?.isUnread).toBe(true)
    expect(client.from).toHaveBeenCalledWith('app_logs')
    expect(mocks.select).toHaveBeenCalledWith(
      'id, level, tag, message, context, created_at, read_at',
    )
    expect(mocks.or).not.toHaveBeenCalled()
    expect(mocks.orderCreated).toHaveBeenCalledWith('created_at', {
      ascending: false,
    })
    expect(mocks.orderId).toHaveBeenCalledWith('id', { ascending: false })
    expect(mocks.limit).toHaveBeenCalledWith(DATA_TABLE_DEFAULT_PAGE_SIZE + 1)
  })

  it('should apply search filters against context_text', async () => {
    const rows = [createDbRow(1, '2026-07-18T14:30:00.000Z')]
    const { client, mocks } = createClientMock(rows)

    await listAppLogsPage(client, {
      filters: {
        ...EMPTY_LOG_LIST_FILTERS,
        search: 'session',
      },
    })

    expect(mocks.or).toHaveBeenCalledWith(
      'message.ilike.%session%,tag.ilike.%session%,context_text.ilike.%session%',
    )
  })

  it('should apply desc cursor filter for the next page', async () => {
    const rows = [createDbRow(1, '2026-07-18T14:30:00.000Z')]
    const { client, mocks } = createClientMock(rows)

    await listAppLogsPage(client, {
      sortDirection: 'desc',
      cursor: { createdAt: '2026-07-18T14:32:07.412Z', id: 5 },
    })

    expect(mocks.or).toHaveBeenCalledWith(
      'created_at.lt.2026-07-18T14:32:07.412Z,and(created_at.eq.2026-07-18T14:32:07.412Z,id.lt.5)',
    )
    expect(mocks.orderCreated).toHaveBeenCalledWith('created_at', {
      ascending: false,
    })
  })

  it('should apply asc cursor filter and ascending order', async () => {
    const rows = [createDbRow(6, '2026-07-18T14:40:00.000Z')]
    const { client, mocks } = createClientMock(rows)

    await listAppLogsPage(client, {
      sortDirection: 'asc',
      cursor: { createdAt: '2026-07-18T14:32:07.412Z', id: 5 },
    })

    expect(mocks.or).toHaveBeenCalledWith(
      'created_at.gt.2026-07-18T14:32:07.412Z,and(created_at.eq.2026-07-18T14:32:07.412Z,id.gt.5)',
    )
    expect(mocks.orderCreated).toHaveBeenCalledWith('created_at', {
      ascending: true,
    })
    expect(mocks.orderId).toHaveBeenCalledWith('id', { ascending: true })
  })

  it('should clear hasNextPage on a short final page', async () => {
    const rows = Array.from(
      { length: DATA_TABLE_DEFAULT_PAGE_SIZE - 1 },
      (_, index) => createDbRow(index + 1, `2026-07-18T14:3${index}:00.000Z`),
    )
    const { client } = createClientMock(rows)

    const result = await listAppLogsPage(client, {
      perPage: DATA_TABLE_DEFAULT_PAGE_SIZE,
    })

    expect(result.rows).toHaveLength(DATA_TABLE_DEFAULT_PAGE_SIZE - 1)
    expect(result.hasNextPage).toBe(false)
  })

  it('should set hasNextPage when an extra row is fetched', async () => {
    const rows = Array.from(
      { length: DATA_TABLE_DEFAULT_PAGE_SIZE + 1 },
      (_, index) => createDbRow(index + 1, `2026-07-18T14:3${index}:00.000Z`),
    )
    const { client } = createClientMock(rows)

    const result = await listAppLogsPage(client, {
      perPage: DATA_TABLE_DEFAULT_PAGE_SIZE,
    })

    expect(result.rows).toHaveLength(DATA_TABLE_DEFAULT_PAGE_SIZE)
    expect(result.hasNextPage).toBe(true)
  })
})
