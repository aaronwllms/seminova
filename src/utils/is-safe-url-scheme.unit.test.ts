import { describe, expect, it } from 'vitest'

import { isSafeUrlScheme } from './is-safe-url-scheme'

describe('isSafeUrlScheme', () => {
  it('should reject javascript, data, and protocol-relative URLs', () => {
    expect(isSafeUrlScheme('javascript:alert(1)')).toBe(false)
    expect(isSafeUrlScheme('data:text/html,<script>alert(1)</script>')).toBe(
      false,
    )
    expect(isSafeUrlScheme('//evil.example')).toBe(false)
  })

  it('should allow same-origin paths', () => {
    expect(isSafeUrlScheme('/avatars/x')).toBe(true)
  })

  it('should allow https Supabase storage URLs', () => {
    expect(
      isSafeUrlScheme(
        'https://example.supabase.co/storage/v1/object/public/avatars/user-id/avatar.webp',
      ),
    ).toBe(true)
  })
})
