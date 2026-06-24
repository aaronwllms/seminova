import type { SupabaseClient, User } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { USERS_PAGE_SIZE } from './admin-user-row'
import { listAdminUsersPage } from './list-admin-users'

vi.mock('@/supabase/service', () => ({
  getServiceEnvForFetch: vi.fn(() => ({
    supabaseUrl: 'https://example.supabase.co',
    secretKey: 'secret-key',
  })),
}))

const createUser = (id: string): User =>
  ({
    id,
    email: `${id}@example.com`,
    created_at: '2024-06-01T12:00:00.000Z',
    app_metadata: {},
  }) as User

const createClientMock = (users: User[]) =>
  ({
    auth: {
      admin: {
        listUsers: vi.fn().mockResolvedValue({
          data: { users },
          error: null,
        }),
      },
    },
  }) as unknown as SupabaseClient

describe('listAdminUsersPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('should set hasNextPage when a full page is returned', async () => {
    const users = Array.from({ length: USERS_PAGE_SIZE }, (_, index) =>
      createUser(`user-${index}`),
    )
    const client = createClientMock(users)

    const result = await listAdminUsersPage(client, { page: 1 })

    expect(result.rows).toHaveLength(USERS_PAGE_SIZE)
    expect(result.hasNextPage).toBe(true)
    expect(client.auth.admin.listUsers).toHaveBeenCalledWith({
      page: 1,
      perPage: USERS_PAGE_SIZE,
    })
  })

  it('should clear hasNextPage on a short final page', async () => {
    const users = Array.from({ length: 49 }, (_, index) =>
      createUser(`user-${index}`),
    )
    const client = createClientMock(users)

    const result = await listAdminUsersPage(client, { page: 2 })

    expect(result.hasNextPage).toBe(false)
    expect(result.page).toBe(2)
  })

  it('should call admin users API with filter when search is long enough', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ users: [createUser('match')] }), {
        status: 200,
      }),
    )

    const client = createClientMock([])

    await listAdminUsersPage(client, {
      page: 1,
      emailFilter: 'match@example.com',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.supabase.co/auth/v1/admin/users?page=1&per_page=50&filter=match%40example.com',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer secret-key',
        }),
      }),
    )
    expect(client.auth.admin.listUsers).not.toHaveBeenCalled()
  })
})
