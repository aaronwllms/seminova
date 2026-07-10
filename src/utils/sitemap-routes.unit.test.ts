import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildSitemapEntries } from './sitemap-routes'

describe('buildSitemapEntries', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should list only marketing routes with absolute URLs', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')
    vi.stubEnv('VERCEL_URL', '')

    const { buildSitemapEntries: buildEntries } =
      await import('./sitemap-routes')

    const entries = buildEntries()

    expect(entries).toEqual([
      { url: 'https://example.com/' },
      { url: 'https://example.com/privacy' },
      { url: 'https://example.com/terms' },
    ])
    expect(
      entries.some(
        (entry) =>
          entry.url.includes('/auth') ||
          entry.url.includes('/admin') ||
          entry.url.includes('/profile'),
      ),
    ).toBe(false)
  })
})
