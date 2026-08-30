import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockCreateClient } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}))

import { createServiceClient } from './service'

describe('createServiceClient', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('should throw when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')

    expect(() => createServiceClient()).toThrow(
      '[supabase-env] Missing NEXT_PUBLIC_SUPABASE_URL',
    )
  })

  it('should throw when SUPABASE_SECRET_KEY is missing', () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', '')

    expect(() => createServiceClient()).toThrow(
      '[supabase-env] Missing SUPABASE_SECRET_KEY',
    )
  })

  it('should create a client with non-persisting auth options', () => {
    const sentinel = { auth: {} }
    mockCreateClient.mockReturnValue(sentinel)

    const client = createServiceClient()

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'sb_secret_test',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
    expect(client).toBe(sentinel)
  })
})
