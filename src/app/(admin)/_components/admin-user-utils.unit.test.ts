import { describe, expect, it } from 'vitest'

import { getEmailInitials } from './admin-user-utils'

describe('getEmailInitials', () => {
  it('should use first letters of split local parts', () => {
    expect(getEmailInitials('alice.smith@example.com')).toBe('AS')
    expect(getEmailInitials('bob_jones@example.com')).toBe('BJ')
  })

  it('should fall back to first two characters of local part', () => {
    expect(getEmailInitials('admin@example.com')).toBe('AD')
  })
})
