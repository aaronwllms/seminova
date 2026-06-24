/**
 * @vitest-environment node
 */
import { NextRequest } from 'next/server'
import { ADMIN_ROLE } from '@/constants/admin-role'
import { updateSession } from './proxy'

const mockGetClaims = vi.fn()

vi.mock('@/utils/env', () => ({
  hasEnvVars: true,
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getClaims: mockGetClaims,
    },
  })),
}))

const createRequest = (pathname: string) =>
  new NextRequest(new URL(`http://localhost:3000${pathname}`))

describe('updateSession', () => {
  beforeEach(() => {
    mockGetClaims.mockClear()
    mockGetClaims.mockResolvedValue({ data: { claims: null } })
  })

  it('should redirect unauthenticated users from protected routes', async () => {
    const response = await updateSession(createRequest('/profile'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/login')
  })

  it('should allow unauthenticated access to public routes', async () => {
    const response = await updateSession(createRequest('/'))

    expect(response.status).toBe(200)
  })

  it('should allow unauthenticated access to auth routes', async () => {
    const response = await updateSession(createRequest('/auth/login'))

    expect(response.status).toBe(200)
  })

  it('should allow authenticated users on protected routes', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1' } },
    })

    const response = await updateSession(createRequest('/profile'))

    expect(response.status).toBe(200)
  })

  it('should redirect non-admin authenticated users from /admin to /profile', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1', app_metadata: {} } },
    })

    const response = await updateSession(createRequest('/admin'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/profile')
  })

  it('should redirect non-admin authenticated users from /admin/users to /profile', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1', app_metadata: {} } },
    })

    const response = await updateSession(createRequest('/admin/users'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/profile')
  })

  it('should allow admin users on /admin/users', async () => {
    mockGetClaims.mockResolvedValue({
      data: {
        claims: { sub: 'admin-1', app_metadata: { role: ADMIN_ROLE } },
      },
    })

    const response = await updateSession(createRequest('/admin/users'))

    expect(response.status).toBe(200)
  })

  it('should redirect unauthenticated users from /admin to login', async () => {
    const response = await updateSession(createRequest('/admin'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/login')
  })

  it('should not treat /administrative as an admin path', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1', app_metadata: {} } },
    })

    const response = await updateSession(createRequest('/administrative'))

    expect(response.status).toBe(200)
  })
})
