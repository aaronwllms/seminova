import { afterEach, describe, expect, it, vi } from 'vitest'

describe('getSupabaseOrigin', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should return null when env is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')

    const { getSupabaseOrigin } = await import('./env')

    expect(getSupabaseOrigin()).toBeNull()
  })

  it('should return null when env is malformed', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'not-a-url')

    const { getSupabaseOrigin } = await import('./env')

    expect(getSupabaseOrigin()).toBeNull()
  })

  it('should return origin when env is valid', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc123.supabase.co')

    const { getSupabaseOrigin } = await import('./env')

    expect(getSupabaseOrigin()).toBe('https://abc123.supabase.co')
  })
})

describe('getSupabaseProjectRef', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should return null when env is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')

    const { getSupabaseProjectRef } = await import('./env')

    expect(getSupabaseProjectRef()).toBeNull()
  })

  it('should return null when env is malformed', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'not-a-url')

    const { getSupabaseProjectRef } = await import('./env')

    expect(getSupabaseProjectRef()).toBeNull()
  })

  it('should return project ref when env is valid', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc123.supabase.co')

    const { getSupabaseProjectRef } = await import('./env')

    expect(getSupabaseProjectRef()).toBe('abc123')
  })
})
