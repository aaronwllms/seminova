import { describe, expect, it } from 'vitest'

import {
  parseProfilePartialInput,
  toProfileFormInput,
  toProfileFormValues,
} from './profile-form-schema'

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

describe('profile form mappers', () => {
  it('should map empty form strings to null profile values', () => {
    expect(
      toProfileFormValues({
        displayName: '  ',
        bio: '',
        avatarUrl: '',
      }),
    ).toEqual({
      displayName: null,
      bio: null,
      avatarUrl: null,
    })
  })

  it('should map null profile values to empty form strings', () => {
    expect(
      toProfileFormInput({
        displayName: null,
        bio: null,
        avatarUrl: null,
      }),
    ).toEqual({
      displayName: '',
      bio: '',
      avatarUrl: '',
    })
  })
})
