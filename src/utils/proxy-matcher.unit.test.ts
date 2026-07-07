import { describe, expect, it } from 'vitest'

import { PROXY_MATCHER_PATTERN } from './proxy-matcher'

const matcher = new RegExp(PROXY_MATCHER_PATTERN)

describe('PROXY_MATCHER_PATTERN', () => {
  it('should exclude metadata image paths from the auth proxy', () => {
    expect(matcher.test('/opengraph-image')).toBe(false)
    expect(matcher.test('/auth/login/opengraph-image')).toBe(false)
    expect(matcher.test('/twitter-image')).toBe(false)
  })

  it('should still run the auth proxy for gated paths', () => {
    expect(matcher.test('/opengraph-image-evil')).toBe(true)
    expect(matcher.test('/profile')).toBe(true)
    expect(matcher.test('/')).toBe(true)
  })

  it('should preserve existing static asset exclusions', () => {
    expect(matcher.test('/favicon.ico')).toBe(false)
    expect(matcher.test('/logo.png')).toBe(false)
  })
})
