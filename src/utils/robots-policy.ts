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
  'Meta-ExternalAgent',
  'Bytespider',
  'cohere-ai',
  'AI2Bot',
] as const

/*
 * REFERENCE — retrieval and user-fetch agents (allowed by default via `*` rule).
 * These bots are never added to TRAINING_CRAWLERS. Disallowing them removes the
 * site from AI-generated answers; blocking training crawlers alone does not.
 * Add explicit allow rules only if you tighten the default `*` rule.
 *
 * Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot, PerplexityBot,
 * Perplexity-User, Meta-ExternalFetcher, MistralAI-User, Amazonbot,
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
