import type { User } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import { mapUserToAdminRow } from './admin-user-row'

const baseUser = {
  id: 'user-1',
  aud: 'authenticated',
  email: 'user@example.com',
  created_at: '2024-06-01T12:00:00.000Z',
  email_confirmed_at: '2024-06-01T12:05:00.000Z',
  last_sign_in_at: '2024-06-15T08:30:00.000Z',
  app_metadata: { role: 'admin' },
  user_metadata: {},
} as User

describe('mapUserToAdminRow', () => {
  it('should map verified admin user fields', () => {
    const row = mapUserToAdminRow(baseUser)

    expect(row).toMatchObject({
      id: 'user-1',
      email: 'user@example.com',
      isVerified: true,
      isAdmin: true,
      lastSignInAtLabel: expect.any(String),
      createdAtLabel: expect.any(String),
    })
  })

  it('should handle unverified non-admin user with missing last sign-in', () => {
    const row = mapUserToAdminRow({
      ...baseUser,
      email_confirmed_at: undefined,
      last_sign_in_at: undefined,
      app_metadata: {},
    } as User)

    expect(row.isVerified).toBe(false)
    expect(row.isAdmin).toBe(false)
    expect(row.lastSignInAtLabel).toBe('—')
  })
})
