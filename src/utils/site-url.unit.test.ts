import { afterEach, describe, expect, it, vi } from 'vitest'

describe('getSiteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should prefer NEXT_PUBLIC_SITE_URL when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')
    vi.stubEnv('VERCEL_URL', 'preview.vercel.app')

    const { getSiteUrl } = await import('./site-url')

    expect(getSiteUrl()).toEqual(new URL('https://example.com'))
  })

  it('should use VERCEL_URL when NEXT_PUBLIC_SITE_URL is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_URL', 'my-app.vercel.app')

    const { getSiteUrl } = await import('./site-url')

    expect(getSiteUrl()).toEqual(new URL('https://my-app.vercel.app'))
  })

  it('should fall back to localhost when no site URL env vars are set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_URL', '')

    const { getSiteUrl } = await import('./site-url')

    expect(getSiteUrl()).toEqual(new URL('http://localhost:3000'))
  })
})
