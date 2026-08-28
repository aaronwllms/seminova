import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/utils/site-url'

/** Training crawlers allowed by default — spinoffs opt out by setting this to `false`. */
export const ALLOW_TRAINING_CRAWLERS = true

const TRAINING_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
] as const

/*
 * REFERENCE — retrieval / user-fetch bots (allowed by default via `*` rule).
 * When ALLOW_TRAINING_CRAWLERS is false, the bots above get per-agent disallow
 * rules. Add explicit allow rules only if you tighten the default `*` rule.
 *
 * Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot, PerplexityBot,
 * Applebot, DuckAssistBot, ChatGPT-User, Claude-User
 */

export const buildRobotsConfig = (
  allowTrainingCrawlers = ALLOW_TRAINING_CRAWLERS,
): MetadataRoute.Robots => ({
  rules: [
    {
      userAgent: '*',
      allow: '/',
    },
    ...(allowTrainingCrawlers
      ? []
      : TRAINING_CRAWLERS.map((userAgent) => ({
          userAgent,
          disallow: '/',
        }))),
  ],
  sitemap: new URL('/sitemap.xml', getSiteUrl()).href,
})
