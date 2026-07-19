import { describe, expect, it } from 'vitest'

import {
  isValidBannerLinkHref,
  parseBannerMessage,
} from './parse-banner-message'

describe('parse-banner-message', () => {
  it('should parse bold segments', () => {
    expect(parseBannerMessage('Hello **world**')).toEqual([
      { type: 'text', content: 'Hello ' },
      { type: 'bold', content: 'world' },
    ])
  })

  it('should parse valid relative and https links', () => {
    expect(
      parseBannerMessage(
        'See [docs](/reference) or [site](https://example.com)',
      ),
    ).toEqual([
      { type: 'text', content: 'See ' },
      { type: 'link', content: 'docs', href: '/reference' },
      { type: 'text', content: ' or ' },
      { type: 'link', content: 'site', href: 'https://example.com' },
    ])
  })

  it('should combine bold and links in one string', () => {
    expect(parseBannerMessage('**Heads up** — read [more](/workflow)')).toEqual(
      [
        { type: 'bold', content: 'Heads up' },
        { type: 'text', content: ' — read ' },
        { type: 'link', content: 'more', href: '/workflow' },
      ],
    )
  })

  it('should leave javascript URLs as plain text', () => {
    expect(parseBannerMessage('[click me](javascript:alert(1))')).toEqual([
      { type: 'text', content: '[click me](javascript:alert(1))' },
    ])
  })

  it('should reject protocol-relative URLs as links', () => {
    expect(isValidBannerLinkHref('//evil.example')).toBe(false)
    expect(parseBannerMessage('[bad](//evil.example)')).toEqual([
      { type: 'text', content: '[bad](//evil.example)' },
    ])
  })

  it('should leave malformed URLs as plain text', () => {
    expect(parseBannerMessage('[broken](not-a-url)')).toEqual([
      { type: 'text', content: '[broken](not-a-url)' },
    ])
  })
})
