import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createServiceClient } from './service'

describe('createServiceClient', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
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

  it('should return a client when env vars are set', () => {
    const client = createServiceClient()

    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })
})
