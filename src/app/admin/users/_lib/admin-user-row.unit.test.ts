import { describe, expect, it } from 'vitest'

import { BAN_PERMANENCE_THRESHOLD_MS } from '@/constants/admin-ban'

import {
  deriveBanStatus,
  mapUserToAdminRow,
  type AdminUserRpcRow,
} from './admin-user-row'

const baseRow: AdminUserRpcRow = {
  id: 'user-1',
  email: 'user@example.com',
  created_at: '2024-06-01T12:00:00.000Z',
  email_confirmed_at: '2024-06-01T12:05:00.000Z',
  last_sign_in_at: '2024-06-15T08:30:00.000Z',
  app_metadata: { role: 'admin' },
  banned_until: null,
}

const fixedNow = new Date('2025-01-01T00:00:00.000Z')

describe('deriveBanStatus', () => {
  it('should return null when not banned', () => {
    expect(deriveBanStatus(null, fixedNow)).toBeNull()
  })

  it('should return finite ban for a future timestamp within the threshold', () => {
    const until = new Date('2025-01-02T00:00:00.000Z')
    const result = deriveBanStatus(until.toISOString(), fixedNow)

    expect(result).toEqual({ until })
  })

  it('should return permanent ban for a far-future timestamp', () => {
    const until = new Date(
      fixedNow.getTime() + BAN_PERMANENCE_THRESHOLD_MS + 60_000,
    )
    const result = deriveBanStatus(until.toISOString(), fixedNow)

    expect(result).toEqual({ permanent: true })
  })

  it('should return null for an expired ban', () => {
    const until = new Date('2024-12-01T00:00:00.000Z')
    const result = deriveBanStatus(until.toISOString(), fixedNow)

    expect(result).toBeNull()
  })
})

describe('mapUserToAdminRow', () => {
  it('should map verified admin user fields', () => {
    const row = mapUserToAdminRow(baseRow)

    expect(row).toMatchObject({
      id: 'user-1',
      email: 'user@example.com',
      isVerified: true,
      isAdmin: true,
      banStatus: null,
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

  it('should derive banStatus from banned_until', () => {
    const until = new Date('2027-06-01T12:00:00.000Z')
    const row = mapUserToAdminRow({
      ...baseRow,
      banned_until: until.toISOString(),
    })

    expect(row.banStatus).toEqual({ until })
  })
})
