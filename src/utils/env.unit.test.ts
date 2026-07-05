import { afterEach, describe, expect, it, vi } from 'vitest'

describe('hasPublicSupabaseEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should be truthy when both public Supabase env vars are set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key')

    const { hasPublicSupabaseEnv } = await import('./env')

    expect(hasPublicSupabaseEnv).toBeTruthy()
  })

  it('should be falsy when public Supabase env vars are missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '')

    const { hasPublicSupabaseEnv } = await import('./env')

    expect(hasPublicSupabaseEnv).toBeFalsy()
  })
})

describe('getPublicSupabaseEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should throw when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key')

    const { getPublicSupabaseEnv } = await import('./env')

    expect(() => getPublicSupabaseEnv()).toThrow(
      '[supabase-env] Missing NEXT_PUBLIC_SUPABASE_URL',
    )
  })

  it('should return public env when configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key')

    const { getPublicSupabaseEnv } = await import('./env')

    expect(getPublicSupabaseEnv()).toEqual({
      supabaseUrl: 'https://test.supabase.co',
      publishableKey: 'test-publishable-key',
    })
  })
})

describe('getServiceSupabaseEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should throw when SUPABASE_SECRET_KEY is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SECRET_KEY', '')

    const { getServiceSupabaseEnv } = await import('./env')

    expect(() => getServiceSupabaseEnv()).toThrow(
      '[supabase-env] Missing SUPABASE_SECRET_KEY',
    )
  })

  it('should return service env when configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test')

    const { getServiceSupabaseEnv } = await import('./env')

    expect(getServiceSupabaseEnv()).toEqual({
      supabaseUrl: 'https://test.supabase.co',
      secretKey: 'sb_secret_test',
    })
  })
})

describe('loadServiceEnvForCli', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should exit when SUPABASE_SECRET_KEY is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SECRET_KEY', '')
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit')
    })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { loadServiceEnvForCli } = await import('./env')

    expect(() => loadServiceEnvForCli()).toThrow('process.exit')
    expect(errorSpy).toHaveBeenCalledWith(
      '[admin-cli] Missing SUPABASE_SECRET_KEY — add it to .env.local',
    )

    exitSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
