import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { tryToParsePath } from 'next/dist/lib/try-to-parse-path'

import { PROXY_MATCHER_PATTERN } from './proxy-matcher'

const matcher = new RegExp(PROXY_MATCHER_PATTERN)

/** Decode a single-quoted JS string literal body from src/proxy.ts source. */
const decodeJsStringLiteral = (value: string): string =>
  value
    .replace(/\\\\/g, '\u0000')
    .replace(/\\(.)/g, '$1')
    .replace(/\u0000/g, '\\')

const extractProxyMatcherFromSource = (source: string): string => {
  const match = source.match(/matcher:\s*\[[\s\S]*?'([^']+)'/)
  if (!match) {
    throw new Error('src/proxy.ts matcher literal not found')
  }
  const capture = match[1]
  if (!capture) {
    throw new Error('src/proxy.ts matcher literal not found')
  }
  return decodeJsStringLiteral(capture)
}

describe('PROXY_MATCHER_PATTERN', () => {
  it('should stay in sync with the literal in src/proxy.ts', () => {
    const proxySource = readFileSync(
      join(process.cwd(), 'src/proxy.ts'),
      'utf8',
    )
    expect(extractProxyMatcherFromSource(proxySource)).toBe(
      PROXY_MATCHER_PATTERN,
    )
  })

  it('should parse as a Next.js middleware matcher', () => {
    const { error } = tryToParsePath(PROXY_MATCHER_PATTERN)
    expect(error).toBeUndefined()
  })

  it('should exclude metadata image paths from the auth proxy', () => {
    expect(matcher.test('/opengraph-image')).toBe(false)
    expect(matcher.test('/auth/login/opengraph-image')).toBe(false)
    expect(matcher.test('/twitter-image')).toBe(false)
    expect(matcher.test('/icon')).toBe(false)
    expect(matcher.test('/auth/login/icon')).toBe(false)
  })

  it('should still run the auth proxy for gated paths', () => {
    expect(matcher.test('/opengraph-image-evil')).toBe(true)
    expect(matcher.test('/icon-evil')).toBe(true)
    expect(matcher.test('/profile')).toBe(true)
    expect(matcher.test('/')).toBe(true)
  })

  it('should preserve existing static asset exclusions', () => {
    expect(matcher.test('/favicon.ico')).toBe(false)
    expect(matcher.test('/logo.png')).toBe(false)
  })

  it('should exclude route-group metadata images with a hash suffix', () => {
    expect(matcher.test('/features/opengraph-image-959drp')).toBe(false)
    expect(matcher.test('/features/opengraph-image-a1b2c')).toBe(false)
    expect(matcher.test('/privacy/twitter-image-abc12')).toBe(false)
  })

  it('should still run the auth proxy for overlong or word-like suffixes', () => {
    expect(matcher.test('/opengraph-image-anything')).toBe(true)
  })
})
