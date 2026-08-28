import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildRobotsConfig } from './robots-policy'

const getRules = (config: ReturnType<typeof buildRobotsConfig>) =>
  Array.isArray(config.rules) ? config.rules : [config.rules]

describe('buildRobotsConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should allow all crawlers including training crawlers by default', () => {
    const rules = getRules(buildRobotsConfig())

    const defaultRule = rules.find((rule) => rule.userAgent === '*')
    expect(defaultRule).toMatchObject({ allow: '/' })

    const trainingCrawlers = [
      'GPTBot',
      'ClaudeBot',
      'CCBot',
      'Google-Extended',
      'Applebot-Extended',
    ]

    for (const userAgent of trainingCrawlers) {
      const rule = rules.find((entry) => entry.userAgent === userAgent)
      expect(rule).toBeUndefined()
    }
  })

  it('should disallow training crawlers when ALLOW_TRAINING_CRAWLERS is false', () => {
    const rules = getRules(buildRobotsConfig(false))

    const trainingCrawlers = [
      'GPTBot',
      'ClaudeBot',
      'CCBot',
      'Google-Extended',
      'Applebot-Extended',
    ]

    for (const userAgent of trainingCrawlers) {
      const rule = rules.find((entry) => entry.userAgent === userAgent)
      expect(rule).toMatchObject({ disallow: '/' })
    }
  })

  it('should reference the sitemap using the env-driven base URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')
    vi.stubEnv('VERCEL_URL', '')

    const { buildRobotsConfig: buildConfig } = await import('./robots-policy')

    expect(buildConfig().sitemap).toBe('https://example.com/sitemap.xml')
  })
})
