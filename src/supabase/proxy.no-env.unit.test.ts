/**
 * @vitest-environment node
 */
import { NextRequest } from 'next/server'

const mockGetClaims = vi.fn()

vi.mock('@/utils/env', () => ({
  hasEnvVars: false,
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
  beforeEach(() => {
    mockGetClaims.mockClear()
  })

  it('should skip auth check when Supabase env vars are not configured', async () => {
    const { updateSession } = await import('./proxy')

    const response = await updateSession(createRequest('/profile'))

    expect(response.status).toBe(200)
    expect(mockGetClaims).not.toHaveBeenCalled()
  })
})
