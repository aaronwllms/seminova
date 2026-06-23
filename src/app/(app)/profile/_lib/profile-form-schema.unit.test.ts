import { describe, expect, it } from 'vitest'

import {
  parseProfileFormInput,
  toProfileFormInput,
  toProfileFormValues,
} from './profile-form-schema'

describe('parseProfileFormInput', () => {
  it('should accept valid profile fields', () => {
    const result = parseProfileFormInput({
      displayName: 'Alex',
      bio: 'Builder',
      avatarUrl: null,
    })

    expect(result).toMatchObject({
      success: true,
      data: { displayName: 'Alex', bio: 'Builder', avatarUrl: null },
    })
  })

  it('should reject invalid input', () => {
    const result = parseProfileFormInput({
      displayName: 'a'.repeat(81),
      bio: null,
      avatarUrl: null,
    })

    expect(result).toMatchObject({
      success: false,
      message: expect.stringContaining('80'),
    })
  })

  it('should accept a versioned avatar URL with query params', () => {
    const result = parseProfileFormInput({
      displayName: null,
      bio: null,
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
