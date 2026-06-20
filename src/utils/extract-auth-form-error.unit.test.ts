import { AuthApiError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import { extractAuthFormError } from './extract-auth-form-error'

describe('extractAuthFormError', () => {
  it('should extract message and raw code from Supabase auth errors', () => {
    const error = new AuthApiError(
      'Invalid login credentials',
      400,
      'invalid_credentials',
    )

    expect(extractAuthFormError(error)).toEqual({
      message: 'Invalid login credentials',
      code: 'invalid_credentials',
    })
  })

  it('should return message only for non-auth errors', () => {
    expect(extractAuthFormError(new Error('Something broke'))).toEqual({
      message: 'Something broke',
    })
  })

  it('should return a fallback message for unknown values', () => {
    expect(extractAuthFormError(null)).toEqual({
      message: 'An error occurred',
    })
  })
})
