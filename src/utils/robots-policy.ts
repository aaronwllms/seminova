import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/utils/site-url'

/** Training crawlers blocked by default — spinoffs opt in per product. */
const TRAINING_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
] as const

/*
 * REFERENCE — retrieval / user-fetch bots (allowed by default via `*` rule).
 * Revisit training consent per product; add explicit allow rules only if you
 * tighten the default `*` rule.
 *
 * Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot, PerplexityBot,
 * Applebot, DuckAssistBot, ChatGPT-User, Claude-User
 */

export const buildRobotsConfig = (): MetadataRoute.Robots => ({
  rules: [
    {
      userAgent: '*',
      allow: '/',
    },
    ...TRAINING_CRAWLERS.map((userAgent) => ({
      userAgent,
      disallow: '/',
    })),
  ],
  sitemap: new URL('/sitemap.xml', getSiteUrl()).href,
})
