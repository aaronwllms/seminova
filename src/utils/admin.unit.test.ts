import { describe, expect, it } from 'vitest'

import { ADMIN_HOME } from '@/constants/admin-paths'
import { ADMIN_ROLE } from '@/constants/admin-role'
import {
  getPostAuthRedirectPath,
  isAdmin,
  isAdminFromAppMetadata,
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
  it('should send admins to /admin and others to /protected', () => {
    expect(getPostAuthRedirectPath({ role: ADMIN_ROLE })).toBe(ADMIN_HOME)
    expect(getPostAuthRedirectPath({})).toBe('/protected')
    expect(getPostAuthRedirectPath(undefined)).toBe('/protected')
  })
})
