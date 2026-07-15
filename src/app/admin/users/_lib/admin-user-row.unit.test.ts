import { describe, expect, it } from 'vitest'

import { mapUserToAdminRow, type AdminUserRpcRow } from './admin-user-row'

const baseRow: AdminUserRpcRow = {
  id: 'user-1',
  email: 'user@example.com',
  created_at: '2024-06-01T12:00:00.000Z',
  email_confirmed_at: '2024-06-01T12:05:00.000Z',
  last_sign_in_at: '2024-06-15T08:30:00.000Z',
  app_metadata: { role: 'admin' },
  banned_until: null,
}

describe('mapUserToAdminRow', () => {
  it('should map verified admin user fields', () => {
    const row = mapUserToAdminRow(baseRow)

    expect(row).toMatchObject({
      id: 'user-1',
      email: 'user@example.com',
      isVerified: true,
      isAdmin: true,
      bannedUntil: null,
      lastSignInAtLabel: expect.any(String),
      createdAtLabel: expect.any(String),
    })
  })

  it('should handle unverified non-admin user with missing last sign-in', () => {
    const row = mapUserToAdminRow({
      ...baseRow,
      email_confirmed_at: null,
      last_sign_in_at: null,
      app_metadata: {},
    })

    expect(row.isVerified).toBe(false)
    expect(row.isAdmin).toBe(false)
    expect(row.lastSignInAtLabel).toBe('—')
  })
})
