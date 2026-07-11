/**
 * @vitest-environment node
 */
import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mockGetClaims = vi.fn()

vi.mock('@/utils/env', () => ({
  hasPublicSupabaseEnv: false,
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

describe('updateSession without env vars', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should skip auth check in development when Supabase env vars are not configured', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const { updateSession } = await import('./proxy')

    const response = await updateSession(createRequest('/home'))

    expect(response.status).toBe(200)
    expect(mockGetClaims).not.toHaveBeenCalled()
  })

  it('should return 503 for all routes in production when env vars are missing', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { updateSession } = await import('./proxy')

    for (const pathname of ['/home', '/', '/auth/login']) {
      const response = await updateSession(createRequest(pathname))

      expect(response.status).toBe(503)
      expect(await response.text()).toContain(
        'Supabase environment variables are not configured',
      )
      expect(mockGetClaims).not.toHaveBeenCalled()
    }
  })
})
