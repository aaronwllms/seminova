describe('hasEnvVars', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should be truthy when both Supabase env vars are set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key')

    const { hasEnvVars } = await import('./env')

    expect(hasEnvVars).toBeTruthy()
  })

  it('should be falsy when Supabase env vars are missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '')

    const { hasEnvVars } = await import('./env')

    expect(hasEnvVars).toBeFalsy()
  })
})
