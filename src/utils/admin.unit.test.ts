import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { APP_HOME } from '@/constants/app-paths'
import { ADMIN_HOME } from '@/constants/admin-paths'
import { ADMIN_ROLE } from '@/constants/admin-role'
import {
  getPostAuthRedirectPath,
  isAdmin,
  isAdminFromAppMetadata,
  parseAppMetadata,
  parseJwtClaims,
} from './admin'

describe('isAdminFromAppMetadata', () => {
  it('should return true when role is admin', () => {
    expect(isAdminFromAppMetadata({ role: ADMIN_ROLE })).toBe(true)
  })

  it('should return false for missing or other roles', () => {
    expect(isAdminFromAppMetadata(undefined)).toBe(false)
    expect(isAdminFromAppMetadata({})).toBe(false)
    expect(isAdminFromAppMetadata({ role: 'editor' })).toBe(false)
  })
})

describe('isAdmin', () => {
  it('should read admin role from JWT app_metadata', () => {
    expect(isAdmin({ app_metadata: { role: ADMIN_ROLE } })).toBe(true)
  })

  it('should return false when claims are missing or not admin', () => {
    expect(isAdmin(null)).toBe(false)
    expect(isAdmin(undefined)).toBe(false)
    expect(isAdmin({ email: 'user@example.com' })).toBe(false)
  })
})

describe('getPostAuthRedirectPath', () => {
  it('should send admins to /admin and others to /home', () => {
    expect(getPostAuthRedirectPath({ role: ADMIN_ROLE })).toBe(ADMIN_HOME)
    expect(getPostAuthRedirectPath({})).toBe(APP_HOME)
    expect(getPostAuthRedirectPath(undefined)).toBe(APP_HOME)
  })

  it('should fail toward non-admin when app_metadata is unparseable', () => {
    expect(getPostAuthRedirectPath({ role: 1 })).toBe(APP_HOME)
    expect(getPostAuthRedirectPath('not-metadata')).toBe(APP_HOME)
  })
})

describe('parseAppMetadata', () => {
  it('should parse string role and preserve other keys', () => {
    expect(parseAppMetadata({ role: ADMIN_ROLE, plan: 'pro' })).toEqual({
      role: ADMIN_ROLE,
      plan: 'pro',
    })
  })

  it('should return undefined for invalid role types', () => {
    expect(parseAppMetadata({ role: 1 })).toBeUndefined()
    expect(parseAppMetadata('bad')).toBeUndefined()
  })
})

describe('parseJwtClaims', () => {
  it('should parse valid claims', () => {
    expect(
      parseJwtClaims({ sub: 'user-1', app_metadata: { role: ADMIN_ROLE } }),
    ).toEqual({
      sub: 'user-1',
      app_metadata: { role: ADMIN_ROLE },
    })
  })

  it('should return null for malformed claims', () => {
    expect(parseJwtClaims({ sub: 1 })).toBeNull()
    expect(parseJwtClaims({ app_metadata: { role: 1 } })).toBeNull()
    expect(parseJwtClaims(null)).toBeNull()
  })
})

describe('admin gate contract', () => {
  const adminSource = readFileSync(
    join(process.cwd(), 'src/utils/admin.ts'),
    'utf8',
  )

  it('should read admin role only from app_metadata, not profiles', () => {
    expect(adminSource).toContain('app_metadata')
    expect(adminSource).toContain('ADMIN_ROLE')
    expect(adminSource).not.toMatch(/\bprofiles\b/)
    expect(adminSource).toMatch(
      /isAdminFromAppMetadata\(claims\?\.app_metadata\)/,
    )
  })
})
