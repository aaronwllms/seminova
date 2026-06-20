import { AuthApiError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import { extractAuthFormError } from './extract-auth-form-error'

describe('extractAuthFormError', () => {
  it('should extract message, raw code, and operational kind from Supabase auth errors', () => {
    const error = new AuthApiError(
      'Invalid login credentials',
      400,
      'invalid_credentials',
    )

    expect(extractAuthFormError(error)).toEqual({
      message: 'Invalid login credentials',
      code: 'invalid_credentials',
      kind: 'operational',
    })
  })

  it('should return fault kind for non-auth errors', () => {
    expect(extractAuthFormError(new Error('Something broke'))).toEqual({
      message: 'Something broke',
      kind: 'fault',
    })
  })

  it('should return fault kind with fallback message for unknown values', () => {
    expect(extractAuthFormError(null)).toEqual({
      message: 'An error occurred',
      kind: 'fault',
    })
  })
})
