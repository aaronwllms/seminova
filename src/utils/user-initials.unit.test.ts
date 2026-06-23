import { describe, expect, it } from 'vitest'

import { getEmailInitials, getProfileInitials } from './user-initials'

describe('getEmailInitials', () => {
  it('should use first letters of split local parts', () => {
    expect(getEmailInitials('alice.smith@example.com')).toBe('AS')
    expect(getEmailInitials('bob_jones@example.com')).toBe('BJ')
  })

  it('should fall back to first two characters of local part', () => {
    expect(getEmailInitials('admin@example.com')).toBe('AD')
  })
})

describe('getProfileInitials', () => {
  it('should prefer display name words over email', () => {
    expect(
      getProfileInitials({
        displayName: 'Alice Smith',
        email: 'other@example.com',
      }),
    ).toBe('AS')
  })

  it('should fall back to email when display name is empty', () => {
    expect(
      getProfileInitials({ displayName: null, email: 'admin@example.com' }),
    ).toBe('AD')
  })
})
