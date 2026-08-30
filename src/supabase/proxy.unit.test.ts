/**
 * @vitest-environment node
 */
import { join } from 'node:path'
import { NextRequest } from 'next/server'
import { ADMIN_ROLE } from '@/constants/admin-role'
import {
  CLIENT_LOGS_RELAY_PATH,
  ROBOTS_PATH,
  SITEMAP_PATH,
} from '@/constants/app-paths'
import {
  discoverAppRoutes,
  discoverMetadataImageFiles,
  isAllowedMetadataImageHome,
} from '@/utils/discover-app-routes'
import { PROXY_MATCHER_PATTERN } from '@/utils/proxy-matcher'
import { isPublicRoute, updateSession } from './proxy'

const EXPECTED_PUBLIC_ROUTES = [
  '/',
  '/terms',
  '/privacy',
  '/reference',
  '/features',
  '/workflow',
  CLIENT_LOGS_RELAY_PATH,
  '/auth/confirm',
  '/auth/error',
  '/auth/forgot-password',
  '/auth/login',
  '/auth/sign-in-link',
  '/auth/sign-up',
  '/auth/sign-up-success',
  '/auth/update-password',
] as const

const proxyMatcher = new RegExp(PROXY_MATCHER_PATTERN)

const mockGetClaims = vi.fn()
const mockSignOut = vi.fn()
const mockAppLogDebug = vi.fn()
const mockAppLogError = vi.fn()
let mockSetAll:
  | ((
      cookies: Array<{
        name: string
        value: string
        options?: Record<string, unknown>
      }>,
    ) => void)
  | null = null

vi.mock('@/utils/env', () => ({
  hasPublicSupabaseEnv: true,
  getPublicSupabaseEnv: () => ({
    supabaseUrl: 'https://example.supabase.co',
    publishableKey: 'test-publishable-key',
  }),
}))

vi.mock('@/utils/app-logger', () => ({
  appLog: {
    debug: (...args: unknown[]) => mockAppLogDebug(...args),
    info: vi.fn(),
    warn: vi.fn(),
    error: (...args: unknown[]) => mockAppLogError(...args),
  },
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((_url, _key, config) => {
    mockSetAll = config.cookies.setAll
    return {
      auth: {
        getClaims: mockGetClaims,
        signOut: mockSignOut,
      },
    }
  }),
}))

const createRequest = (pathname: string) =>
  new NextRequest(new URL(`http://localhost:3000${pathname}`))

describe('updateSession', () => {
  beforeEach(() => {
    mockGetClaims.mockClear()
    mockSignOut.mockClear()
    mockAppLogDebug.mockClear()
    mockAppLogError.mockClear()
    mockSetAll = null
    mockSignOut.mockResolvedValue({ error: null })
    mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null })
  })

  it('should redirect unauthenticated users from protected routes with next', async () => {
    mockSignOut.mockImplementation(async () => {
      mockSetAll?.([
        {
          name: 'sb-test-auth-token',
          value: '',
          options: {
            httpOnly: true,
            maxAge: 0,
            path: '/',
            sameSite: 'lax',
            secure: true,
          },
        },
      ])
      return { error: null }
    })

    const response = await updateSession(createRequest('/home'))

    expect(response.status).toBe(307)
    const location = response.headers.get('location')
    expect(location).toContain('/auth/login')
    expect(location).toContain('next=%2Fhome')
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' })

    const setCookie = response.headers.get('set-cookie') ?? ''
    expect(setCookie).toMatch(/HttpOnly/i)
    expect(setCookie).toMatch(/Max-Age=0|Expires=/i)
  })

  it('should preserve search params in next on redirect', async () => {
    const response = await updateSession(
      createRequest('/admin/users?email=foo'),
    )

    expect(response.status).toBe(307)
    const location = response.headers.get('location')
    expect(location).toContain('next=')
    expect(location).toContain('%2Fadmin%2Fusers')
    expect(location).toContain('email%3Dfoo')
  })

  it('should redirect and sign out when getClaims returns an auth error', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: null },
      error: { message: 'Invalid Refresh Token: Already Used' },
    })

    const response = await updateSession(createRequest('/home'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/login')
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(mockAppLogError).toHaveBeenCalledWith(
      'proxy',
      'Session invalid on protected route',
      expect.objectContaining({
        pathname: '/home',
        message: 'Invalid Refresh Token: Already Used',
      }),
    )
  })

  it('should redirect stray auth code on protected routes to auth error', async () => {
    const response = await updateSession(createRequest('/home?code=abc'))

    expect(response.status).toBe(307)
    const location = response.headers.get('location')
    expect(location).toContain('/auth/error')
    expect(location).toContain('source=stray_code')
    expect(location).not.toContain('/auth/login')
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

  it('should allow unauthenticated access to terms routes', async () => {
    const response = await updateSession(createRequest('/terms'))

    expect(response.status).toBe(200)
  })

  it('should allow unauthenticated access to privacy routes', async () => {
    const response = await updateSession(createRequest('/privacy'))

    expect(response.status).toBe(200)
  })

  it('should allow unauthenticated access to terms routes with a trailing slash', async () => {
    const response = await updateSession(createRequest('/terms/'))

    expect(response.status).toBe(200)
  })

  it('should allow unauthenticated access to privacy routes with a trailing slash', async () => {
    const response = await updateSession(createRequest('/privacy/'))

    expect(response.status).toBe(200)
  })

  it('should treat robots.txt and sitemap.xml as public routes', () => {
    expect(isPublicRoute(ROBOTS_PATH)).toBe(true)
    expect(isPublicRoute(SITEMAP_PATH)).toBe(true)
  })

  it('should allow unauthenticated access to robots.txt and sitemap.xml', async () => {
    for (const pathname of [ROBOTS_PATH, SITEMAP_PATH]) {
      const response = await updateSession(createRequest(pathname))

      expect(response.status).toBe(200)
    }
  })

  it('should clear stale sessions on auth routes when getClaims returns an auth error', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: null },
      error: { message: 'Invalid Refresh Token: Refresh Token Not Found' },
    })

    const response = await updateSession(createRequest('/auth/login'))

    expect(response.status).toBe(200)
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(mockAppLogError).toHaveBeenCalledWith(
      'proxy',
      'Clearing stale session on public route',
      expect.objectContaining({
        pathname: '/auth/login',
        message: 'Invalid Refresh Token: Refresh Token Not Found',
      }),
    )
  })

  it('should allow authenticated users on protected routes', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1' } },
    })

    const response = await updateSession(createRequest('/home'))

    expect(response.status).toBe(200)
    expect(mockAppLogDebug).toHaveBeenCalledWith(
      'proxy',
      'Session token reused',
      { pathname: '/home', refreshed: false },
    )
  })

  it('should log refreshed true when auth cookies are rewritten', async () => {
    mockGetClaims.mockImplementation(async () => {
      mockSetAll?.([{ name: 'sb-test-auth-token', value: 'chunk' }])
      return { data: { claims: { sub: 'user-1' } } }
    })

    await updateSession(createRequest('/home'))

    expect(mockAppLogDebug).toHaveBeenCalledWith(
      'proxy',
      'Session token refreshed',
      { pathname: '/home', refreshed: true },
    )
  })

  it('should not emit session debug on public routes', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1' } },
    })

    await updateSession(createRequest('/'))

    expect(mockAppLogDebug).not.toHaveBeenCalled()
  })

  it('should not emit session debug when redirecting unauthenticated users', async () => {
    await updateSession(createRequest('/home'))

    expect(mockAppLogDebug).not.toHaveBeenCalled()
  })

  it('should redirect non-admin authenticated users from /admin to /home', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1', app_metadata: {} } },
    })

    const response = await updateSession(createRequest('/admin'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/home')
  })

  it('should redirect non-admin authenticated users from /admin/users to /home', async () => {
    mockGetClaims.mockImplementation(async () => {
      mockSetAll?.([
        {
          name: 'sb-test-auth-token',
          value: 'refreshed-chunk',
          options: {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: true,
          },
        },
      ])
      return { data: { claims: { sub: 'user-1', app_metadata: {} } } }
    })

    const response = await updateSession(createRequest('/admin/users'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/home')

    const setCookie = response.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('sb-test-auth-token=refreshed-chunk')
    expect(setCookie).toMatch(/HttpOnly/i)
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

    const response = await updateSession(createRequest('/home'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/login')
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' })
  })

  it('should redirect protected routes when claims omit sub', async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { email: 'user@example.com' } },
      error: null,
    })

    const response = await updateSession(createRequest('/home'))

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

  it('should not treat /authoring as a public route', () => {
    expect(isPublicRoute('/authoring')).toBe(false)
  })

  it('should redirect unauthenticated users from /authoring to login', async () => {
    const response = await updateSession(createRequest('/authoring'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/login')
  })
})

describe('auth boundary (discovered routes)', () => {
  const appDir = join(process.cwd(), 'src/app')
  const discoveredRoutes = discoverAppRoutes(appDir)
  const publicRoutes = discoveredRoutes.filter(isPublicRoute)
  const protectedRoutes = discoveredRoutes.filter(
    (route) => !isPublicRoute(route),
  )

  beforeEach(() => {
    mockGetClaims.mockClear()
    mockSignOut.mockClear()
    mockAppLogDebug.mockClear()
    mockAppLogError.mockClear()
    mockSetAll = null
    mockSignOut.mockResolvedValue({ error: null })
    mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null })
  })

  it('should discover app routes from src/app', () => {
    expect(discoveredRoutes.length).toBeGreaterThan(0)
    expect(discoveredRoutes).toContain('/')
    expect(discoveredRoutes).toContain('/home')
    expect(discoveredRoutes).not.toContain('/profile')
    expect(discoveredRoutes).toContain('/admin')
    expect(discoveredRoutes).toContain('/auth/login')
    expect(discoveredRoutes).toContain('/auth/confirm')
    expect(discoveredRoutes).toContain(CLIENT_LOGS_RELAY_PATH)
    expect(discoveredRoutes).toContain('/terms')
    expect(discoveredRoutes).toContain('/privacy')
  })

  it('should match the explicit public-route allowlist', () => {
    expect([...publicRoutes].sort()).toEqual([...EXPECTED_PUBLIC_ROUTES].sort())
  })

  it('should match every protected route through the proxy matcher', () => {
    for (const pathname of protectedRoutes) {
      expect(proxyMatcher.test(pathname)).toBe(true)
    }
  })

  it('should keep metadata image files in allowed homes only', () => {
    const metadataImageFiles = discoverMetadataImageFiles(appDir)

    expect(metadataImageFiles.length).toBeGreaterThan(0)
    expect(
      metadataImageFiles.every((file) =>
        isAllowedMetadataImageHome(file.dirSegments),
      ),
    ).toBe(true)
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
