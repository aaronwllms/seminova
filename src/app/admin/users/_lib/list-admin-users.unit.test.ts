import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DATA_TABLE_DEFAULT_PAGE_SIZE } from '@/constants/data-table'

import { type AdminUserRpcRow } from './admin-user-row'
import { listAdminUsersPage } from './list-admin-users'

const createRpcRow = (id: string): AdminUserRpcRow => ({
  id,
  email: `${id}@example.com`,
  email_confirmed_at: '2024-06-01T12:00:00.000Z',
  created_at: '2024-06-01T12:00:00.000Z',
  last_sign_in_at: null,
  app_metadata: {},
  banned_until: null,
})

const createClientMock = (rows: AdminUserRpcRow[]) =>
  ({
    rpc: vi.fn().mockResolvedValue({
      data: rows,
      error: null,
    }),
  }) as unknown as SupabaseClient

describe('listAdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set hasNextPage when a full page is returned', async () => {
    const rows = Array.from(
      { length: DATA_TABLE_DEFAULT_PAGE_SIZE },
      (_, index) => createRpcRow(`user-${index}`),
    )
    const client = createClientMock(rows)

    const result = await listAdminUsersPage(client, { page: 1 })

    expect(result.rows).toHaveLength(DATA_TABLE_DEFAULT_PAGE_SIZE)
    expect(result.hasNextPage).toBe(true)
    expect(client.rpc).toHaveBeenCalledWith('admin_list_users', {
      p_sort_column: 'created_at',
      p_sort_direction: 'desc',
      p_page: 1,
      p_per_page: DATA_TABLE_DEFAULT_PAGE_SIZE,
      p_search: '',
      p_filter_unverified: false,
      p_filter_banned: false,
      p_filter_new_30d: false,
    })
  })

  it('should clear hasNextPage on a short final page', async () => {
    const rows = Array.from(
      { length: DATA_TABLE_DEFAULT_PAGE_SIZE - 1 },
      (_, index) => createRpcRow(`user-${index}`),
    )
    const client = createClientMock(rows)

    const result = await listAdminUsersPage(client, { page: 2 })

    expect(result.hasNextPage).toBe(false)
    expect(result.page).toBe(2)
  })

  it('should forward search, sort, and page size to the RPC', async () => {
    const client = createClientMock([createRpcRow('match')])

    await listAdminUsersPage(client, {
      page: 3,
      perPage: 25,
      emailFilter: 'match@example.com',
      sortColumn: 'email',
      sortDirection: 'asc',
    })

    expect(client.rpc).toHaveBeenCalledWith('admin_list_users', {
      p_sort_column: 'email',
      p_sort_direction: 'asc',
      p_page: 3,
      p_per_page: 25,
      p_search: 'match@example.com',
      p_filter_unverified: false,
      p_filter_banned: false,
      p_filter_new_30d: false,
    })
  })

  it('should forward filter flags to the RPC', async () => {
    const client = createClientMock([])

    await listAdminUsersPage(client, {
      page: 1,
      filterUnverified: true,
      filterBanned: true,
      filterNew30d: true,
    })

    expect(client.rpc).toHaveBeenCalledWith(
      'admin_list_users',
      expect.objectContaining({
        p_filter_unverified: true,
        p_filter_banned: true,
        p_filter_new_30d: true,
      }),
    )
  })

  it('should omit short search filters from the RPC call', async () => {
    const client = createClientMock([])

    await listAdminUsersPage(client, {
      page: 1,
      emailFilter: 'ab',
    })

    expect(client.rpc).toHaveBeenCalledWith(
      'admin_list_users',
      expect.objectContaining({
        p_search: '',
      }),
    )
  })
})
