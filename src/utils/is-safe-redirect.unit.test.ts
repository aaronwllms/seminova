import { isSafeRedirect, isUsableRedirectNext } from './is-safe-redirect'

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

  it('should return false when URL parsing throws', () => {
    expect(isSafeRedirect('http://[%', baseUrl)).toBe(false)
  })
})

describe('isUsableRedirectNext', () => {
  it('should allow same-origin paths below the site root', () => {
    expect(isUsableRedirectNext('/home', baseUrl)).toBe(true)
    expect(isUsableRedirectNext('/admin/logs?level=error', baseUrl)).toBe(true)
  })

  it('should reject the site root', () => {
    expect(isUsableRedirectNext('/', baseUrl)).toBe(false)
    expect(isUsableRedirectNext('http://localhost/', baseUrl)).toBe(false)
  })

  it('should reject off-origin URLs', () => {
    expect(isUsableRedirectNext('https://evil.com/home', baseUrl)).toBe(false)
  })
})
