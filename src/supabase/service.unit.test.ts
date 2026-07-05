import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createServiceClient, getServiceEnvForFetch } from './service'

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
      '[supabase-service] Missing NEXT_PUBLIC_SUPABASE_URL',
    )
  })

  it('should throw when SUPABASE_SECRET_KEY is missing', () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', '')

    expect(() => createServiceClient()).toThrow(
      '[supabase-service] Missing SUPABASE_SECRET_KEY',
    )
  })

  it('should return a client when env vars are set', () => {
    const client = createServiceClient()

    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })
})

describe('getServiceEnvForFetch', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should throw when env vars are missing', () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', '')

    expect(() => getServiceEnvForFetch()).toThrow(
      '[supabase-service] Missing SUPABASE_SECRET_KEY',
    )
  })

  it('should return env values when configured', () => {
    expect(getServiceEnvForFetch()).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      secretKey: 'sb_secret_test',
    })
  })
})
