/**
 * @vitest-environment node
 */
import { join } from 'node:path'
import { NextRequest } from 'next/server'
import { ADMIN_ROLE } from '@/constants/admin-role'
import {
  discoverAppRoutes,
  isPublicAppRoute,
} from '@/utils/discover-app-routes'
import { updateSession } from './proxy'

const mockGetClaims = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/utils/env', () => ({
  hasPublicSupabaseEnv: true,
  getPublicSupabaseEnv: () => ({
    supabaseUrl: 'https://example.supabase.co',
    publishableKey: 'test-publishable-key',
  }),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getClaims: mockGetClaims,
      signOut: mockSignOut,
    },
  })),
}))

const createRequest = (pathname: string) =>
  new NextRequest(new URL(`http://localhost:3000${pathname}`))

describe('updateSession', () => {
  beforeEach(() => {
    mockGetClaims.mockClear()
    mockSignOut.mockClear()
    mockSignOut.mockResolvedValue({ error: null })
    mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null })
  })

  it('should redirect unauthenticated users from protected routes', async () => {
    const response = await updateSession(createRequest('/profile'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/login')
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' })
  })

  it('should redirect and sign out when getClaims returns an auth error', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: null },
      error: { message: 'Invalid Refresh Token: Already Used' },
    })

    const response = await updateSession(createRequest('/profile'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/login')
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' })
  })

  it('should allow unauthenticated access to public routes', async () => {
    const response = await updateSession(createRequest('/'))

    expect(response.status).toBe(200)
  })

  it('should allow unauthenticated access to auth routes', async () => {
    const response = await updateSession(createRequest('/auth/login'))

    expect(response.status).toBe(200)
  })

  it('should clear stale sessions on auth routes when getClaims returns an auth error', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: null },
      error: { message: 'Invalid Refresh Token: Refresh Token Not Found' },
    })

    const response = await updateSession(createRequest('/auth/login'))

    expect(response.status).toBe(200)
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' })
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

  it('should redirect protected routes when claims are malformed', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 123 } },
      error: null,
    })

    const response = await updateSession(createRequest('/profile'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/login')
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' })
  })

  it('should redirect protected routes when claims omit sub', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { email: 'user@example.com' } },
      error: null,
    })

    const response = await updateSession(createRequest('/profile'))

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

describe('auth boundary (discovered routes)', () => {
  const appDir = join(process.cwd(), 'src/app')
  const discoveredRoutes = discoverAppRoutes(appDir)
  const publicRoutes = discoveredRoutes.filter(isPublicAppRoute)
  const protectedRoutes = discoveredRoutes.filter(
    (route) => !isPublicAppRoute(route),
  )

  beforeEach(() => {
    mockGetClaims.mockClear()
    mockSignOut.mockClear()
    mockSignOut.mockResolvedValue({ error: null })
    mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null })
  })

  it('should discover app routes from src/app', () => {
    expect(discoveredRoutes.length).toBeGreaterThan(0)
    expect(discoveredRoutes).toContain('/')
    expect(discoveredRoutes).toContain('/profile')
    expect(discoveredRoutes).toContain('/admin')
    expect(discoveredRoutes).toContain('/auth/login')
    expect(discoveredRoutes).toContain('/auth/confirm')
  })

  it.each(publicRoutes)(
    'should allow unauthenticated access to public route %s',
    async (pathname) => {
      const response = await updateSession(createRequest(pathname))

      expect(response.status).toBe(200)
      const location = response.headers.get('location')
      expect(location === null || !location.includes('/auth/login')).toBe(true)
    },
  )

  it.each(protectedRoutes)(
    'should redirect unauthenticated users from protected route %s to login',
    async (pathname) => {
      const response = await updateSession(createRequest(pathname))

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/auth/login')
    },
  )
})
