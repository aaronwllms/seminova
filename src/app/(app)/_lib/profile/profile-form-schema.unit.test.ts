import { describe, expect, it } from 'vitest'

import { parseProfilePartialInput } from './profile-form-schema'

describe('parseProfilePartialInput', () => {
  it('should accept a single valid field', () => {
    const result = parseProfilePartialInput({
      displayName: 'Alex',
    })

    expect(result).toMatchObject({
      success: true,
      data: { displayName: 'Alex' },
    })
  })

  it('should reject empty partial payload', () => {
    const result = parseProfilePartialInput({})

    expect(result).toMatchObject({
      success: false,
      message: expect.stringContaining('At least one'),
    })
  })

  it('should reject invalid field values', () => {
    const result = parseProfilePartialInput({
      displayName: 'a'.repeat(81),
    })

    expect(result).toMatchObject({
      success: false,
      message: expect.stringContaining('80'),
    })
  })

  it('should reject bio longer than 160 characters', () => {
    const result = parseProfilePartialInput({
      bio: 'a'.repeat(161),
    })

    expect(result).toMatchObject({
      success: false,
      message: expect.stringContaining('160'),
    })
  })

  it('should accept a versioned avatar URL with query params', () => {
    const result = parseProfilePartialInput({
      avatarUrl:
        'https://example.supabase.co/storage/v1/object/public/avatars/user-id/avatar.webp?v=1719158400000',
    })

    expect(result).toMatchObject({
      success: true,
      data: {
        avatarUrl:
          'https://example.supabase.co/storage/v1/object/public/avatars/user-id/avatar.webp?v=1719158400000',
      },
    })
  })
})
