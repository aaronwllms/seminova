import type { SupabaseClient, User } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import { ADMIN_ROLE } from '@/constants/admin-role'

import {
  demoteUserById,
  getRoleMutationToastMessage,
  mergeDemoteMetadata,
  mergePromoteMetadata,
  promoteUserById,
} from './admin-role-mutations'

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

const createMockClient = (
  user: User | null,
  options?: { getUserError?: Error; updateError?: Error },
): SupabaseClient => {
  return {
    auth: {
      admin: {
        getUserById: vi.fn().mockResolvedValue({
          data: { user },
          error: options?.getUserError ?? null,
        }),
        updateUserById: vi.fn().mockResolvedValue({
          data: {},
          error: options?.updateError ?? null,
        }),
      },
    },
  } as unknown as SupabaseClient
}

describe('mergePromoteMetadata', () => {
  it('should set role to admin while preserving existing keys', () => {
    expect(mergePromoteMetadata({ org: 'acme' })).toEqual({
      org: 'acme',
      role: ADMIN_ROLE,
    })
  })

  it('should set role when app_metadata is undefined', () => {
    expect(mergePromoteMetadata(undefined)).toEqual({ role: ADMIN_ROLE })
  })
})

describe('mergeDemoteMetadata', () => {
  it('should use role null for Supabase shallow-merge key deletion', () => {
    expect(mergeDemoteMetadata({ role: ADMIN_ROLE, org: 'acme' })).toEqual({
      role: null,
    })
  })
})

describe('getRoleMutationToastMessage', () => {
  it('should return end-state copy for each mutation status', () => {
    expect(getRoleMutationToastMessage('promoted')).toBe(
      'User promoted to admin',
    )
    expect(getRoleMutationToastMessage('already_admin')).toBe(
      'User is already an admin',
    )
    expect(getRoleMutationToastMessage('demoted')).toBe(
      'User demoted from admin',
    )
    expect(getRoleMutationToastMessage('not_admin')).toBe(
      'User is not an admin',
    )
  })
})

describe('promoteUserById', () => {
  it('should return not_found when user does not exist', async () => {
    const client = createMockClient(null)

    const result = await promoteUserById(client, 'missing-id')

    expect(result).toEqual({ status: 'not_found' })
  })

  it('should return already_admin without calling updateUserById', async () => {
    const user = createMockUser({
      app_metadata: { role: ADMIN_ROLE },
    })
    const client = createMockClient(user)

    const result = await promoteUserById(client, 'user-1')

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
    const client = createMockClient(user)

    const result = await promoteUserById(client, 'user-1')

    expect(result).toEqual({
      status: 'promoted',
      email: 'alice@example.com',
    })
    expect(client.auth.admin.updateUserById).toHaveBeenCalledWith('user-1', {
      app_metadata: { org: 'acme', role: ADMIN_ROLE },
    })
  })
})

describe('demoteUserById', () => {
  it('should return not_found when user does not exist', async () => {
    const client = createMockClient(null)

    const result = await demoteUserById(client, 'missing-id')

    expect(result).toEqual({ status: 'not_found' })
  })

  it('should return not_admin when user has no admin role', async () => {
    const client = createMockClient(createMockUser())

    const result = await demoteUserById(client, 'user-1')

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
    const client = createMockClient(user)

    const result = await demoteUserById(client, 'user-1')

    expect(result).toEqual({
      status: 'demoted',
      email: 'alice@example.com',
    })
    expect(client.auth.admin.updateUserById).toHaveBeenCalledWith('user-1', {
      app_metadata: { role: null },
    })
  })
})
