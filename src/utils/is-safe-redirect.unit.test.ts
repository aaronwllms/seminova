import { isSafeRedirect } from './is-safe-redirect'

const baseUrl = 'http://localhost/auth/confirm'

describe('isSafeRedirect', () => {
  it('should allow same-origin relative paths', () => {
    expect(isSafeRedirect('/profile', baseUrl)).toBe(true)
  })

  it('should reject off-origin absolute URLs', () => {
    expect(isSafeRedirect('https://evil.com', baseUrl)).toBe(false)
  })

  it('should reject protocol-relative off-origin URLs', () => {
    expect(isSafeRedirect('//evil.com', baseUrl)).toBe(false)
  })
})
