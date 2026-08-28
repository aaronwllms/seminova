import { AuthApiError } from '@supabase/supabase-js'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { extractAuthFormError } from './extract-auth-form-error'

const mockClientLogError = vi.fn()

vi.mock('@/utils/client-logger', () => ({
  clientLog: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: (...args: unknown[]) => mockClientLogError(...args),
  },
}))

describe('extractAuthFormError', () => {
  afterEach(() => {
    mockClientLogError.mockReset()
  })

  it('should not log mapped auth codes', () => {
    const error = new AuthApiError(
      'Invalid login credentials',
      400,
      'invalid_credentials',
    )

    extractAuthFormError(error)

    expect(mockClientLogError).not.toHaveBeenCalled()
  })

  it('should not log otp_expired mapping', () => {
    const error = new AuthApiError('OTP has expired', 403, 'otp_expired')

    extractAuthFormError(error, { otpExpired: true })

    expect(mockClientLogError).not.toHaveBeenCalled()
  })

  it('should log supabaseCode for unmapped auth codes', () => {
    const error = new AuthApiError(
      'User already registered',
      400,
      'user_already_exists',
    )

    extractAuthFormError(error)

    expect(mockClientLogError).toHaveBeenCalledWith(
      'auth-form-error',
      'Supabase auth error',
      { supabaseCode: 'user_already_exists' },
    )
  })

  it('should include email in the unmapped auth log when provided', () => {
    const error = new AuthApiError(
      'User already registered',
      400,
      'user_already_exists',
    )

    extractAuthFormError(error, { email: 'user@example.com' })

    expect(mockClientLogError).toHaveBeenCalledWith(
      'auth-form-error',
      'Supabase auth error',
      { email: 'user@example.com', supabaseCode: 'user_already_exists' },
    )
  })

  it('should log non-auth errors', () => {
    extractAuthFormError(new Error('Something broke'))

    expect(mockClientLogError).toHaveBeenCalledWith(
      'auth-form-error',
      'Non-auth error',
      { message: 'Something broke' },
    )
  })

  it('should log unknown values as non-auth errors', () => {
    extractAuthFormError(null)

    expect(mockClientLogError).toHaveBeenCalledWith(
      'auth-form-error',
      'Non-auth error',
      { message: 'An error occurred' },
    )
  })
})
