import type { SupabaseClient, User } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import { ADMIN_ROLE } from '@/constants/admin-role'

import {
  demoteUser,
  isUserAdmin,
  listAdminUsers,
  promoteUser,
} from './admin-users'

const createMockUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    email: 'alice@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }) as User

const createMockClient = (users: User[]): SupabaseClient => {
  const userById = new Map(users.map((user) => [user.id, user]))

  return {
    auth: {
      admin: {
        listUsers: vi.fn().mockResolvedValue({
          data: { users },
          error: null,
        }),
        getUserById: vi.fn().mockImplementation(async (id: string) => ({
          data: { user: userById.get(id) ?? null },
          error: null,
        })),
        updateUserById: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
    },
  } as unknown as SupabaseClient
}

describe('isUserAdmin', () => {
  it('should return true only when role is admin', () => {
    expect(isUserAdmin({ role: ADMIN_ROLE })).toBe(true)
    expect(isUserAdmin({ role: 'editor' })).toBe(false)
    expect(isUserAdmin(undefined)).toBe(false)
  })
})

describe('promoteUser', () => {
  it('should return not_found when email does not exist', async () => {
    const client = createMockClient([])

    const result = await promoteUser(client, 'missing@example.com')

    expect(result).toEqual({ status: 'not_found' })
  })

  it('should return already_admin without calling updateUserById', async () => {
    const user = createMockUser({
      app_metadata: { role: ADMIN_ROLE },
    })
    const client = createMockClient([user])

    const result = await promoteUser(client, 'alice@example.com')

    expect(result).toEqual({
      status: 'already_admin',
      email: 'alice@example.com',
    })
    expect(client.auth.admin.updateUserById).not.toHaveBeenCalled()
  })

  it('should promote user with merged app_metadata', async () => {
    const user = createMockUser({
      app_metadata: { org: 'acme' },
    })
    const client = createMockClient([user])

    const result = await promoteUser(client, 'alice@example.com')

    expect(result).toEqual({
      status: 'promoted',
      email: 'alice@example.com',
    })
    expect(client.auth.admin.updateUserById).toHaveBeenCalledWith('user-1', {
      app_metadata: { org: 'acme', role: ADMIN_ROLE },
    })
  })
})

describe('demoteUser', () => {
  it('should return not_found when email does not exist', async () => {
    const client = createMockClient([])

    const result = await demoteUser(client, 'missing@example.com')

    expect(result).toEqual({ status: 'not_found' })
  })

  it('should return not_admin when user has no admin role', async () => {
    const client = createMockClient([createMockUser()])

    const result = await demoteUser(client, 'alice@example.com')

    expect(result).toEqual({
      status: 'not_admin',
      email: 'alice@example.com',
    })
    expect(client.auth.admin.updateUserById).not.toHaveBeenCalled()
  })

  it('should demote by removing role key from app_metadata', async () => {
    const user = createMockUser({
      app_metadata: { role: ADMIN_ROLE, org: 'acme' },
    })
    const client = createMockClient([user])

    const result = await demoteUser(client, 'alice@example.com')

    expect(result).toEqual({
      status: 'demoted',
      email: 'alice@example.com',
    })
    expect(client.auth.admin.updateUserById).toHaveBeenCalledWith('user-1', {
      app_metadata: { role: null },
    })
  })
})

describe('listAdminUsers', () => {
  it('should return sorted admin emails only', async () => {
    const client = createMockClient([
      createMockUser({
        email: 'zoe@example.com',
        app_metadata: { role: ADMIN_ROLE },
      }),
      createMockUser({ id: 'user-2', email: 'bob@example.com' }),
      createMockUser({
        id: 'user-3',
        email: 'alice@example.com',
        app_metadata: { role: ADMIN_ROLE },
      }),
    ])

    const result = await listAdminUsers(client)

    expect(result).toEqual(['alice@example.com', 'zoe@example.com'])
  })
})
