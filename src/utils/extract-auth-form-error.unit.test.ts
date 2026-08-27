import { AuthApiError } from '@supabase/supabase-js'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  AUTH_ERROR_FALLBACK_MESSAGE,
  extractAuthFormError,
} from './extract-auth-form-error'

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

  it('should map invalid_credentials to sanitized copy without logging', () => {
    const error = new AuthApiError(
      'Invalid login credentials',
      400,
      'invalid_credentials',
    )

    expect(extractAuthFormError(error)).toEqual({
      message: 'Invalid email or password.',
      code: 'SUPABASE_AUTH_ERROR',
      kind: 'operational',
    })
    expect(mockClientLogError).not.toHaveBeenCalled()
  })

  it('should map weak_password to VALIDATION_ERROR', () => {
    const error = new AuthApiError('Password too weak', 400, 'weak_password')

    expect(extractAuthFormError(error)).toEqual({
      message:
        "Your password doesn't meet the strength requirements. Please choose a stronger one.",
      code: 'VALIDATION_ERROR',
      kind: 'operational',
    })
  })

  it('should map unexpected_failure to INTERNAL_ERROR fault', () => {
    const error = new AuthApiError(
      'Unexpected failure',
      500,
      'unexpected_failure',
    )

    expect(extractAuthFormError(error)).toEqual({
      message:
        'Something went wrong on our end. Please try again, or contact support if it continues.',
      code: 'INTERNAL_ERROR',
      kind: 'fault',
    })
  })

  it('should map otp_expired to mismatch copy when otpExpired is false', () => {
    const error = new AuthApiError('OTP has expired', 403, 'otp_expired')

    expect(extractAuthFormError(error, { otpExpired: false })).toEqual({
      message: "That code didn't match. Please try again.",
      code: 'SUPABASE_AUTH_ERROR',
      kind: 'operational',
    })
    expect(mockClientLogError).not.toHaveBeenCalled()
  })

  it('should map otp_expired to expired copy when otpExpired is true', () => {
    const error = new AuthApiError('OTP has expired', 403, 'otp_expired')

    expect(extractAuthFormError(error, { otpExpired: true })).toEqual({
      message: 'That code has expired. Please request a new one.',
      code: 'SUPABASE_AUTH_ERROR',
      kind: 'operational',
    })
    expect(mockClientLogError).not.toHaveBeenCalled()
  })

  it('should default otp_expired to mismatch copy when otpExpired is absent', () => {
    const error = new AuthApiError('OTP has expired', 403, 'otp_expired')

    expect(extractAuthFormError(error, { email: 'user@example.com' })).toEqual({
      message: "That code didn't match. Please try again.",
      code: 'SUPABASE_AUTH_ERROR',
      kind: 'operational',
    })
    expect(mockClientLogError).not.toHaveBeenCalled()
  })

  it('should map user_banned to suspension copy without logging', () => {
    const error = new AuthApiError('User is banned', 403, 'user_banned')

    expect(extractAuthFormError(error)).toEqual({
      message:
        'Your account has been suspended. Contact support if you believe this is a mistake.',
      code: 'SUPABASE_AUTH_ERROR',
      kind: 'operational',
    })
    expect(mockClientLogError).not.toHaveBeenCalled()
  })

  it('should fold email_not_confirmed into invalid credentials copy', () => {
    const error = new AuthApiError(
      'Email not confirmed',
      400,
      'email_not_confirmed',
    )

    expect(extractAuthFormError(error)).toEqual({
      message: 'Invalid email or password.',
      code: 'SUPABASE_AUTH_ERROR',
      kind: 'operational',
    })
  })

  it('should fall back for user_already_exists and log supabaseCode', () => {
    const error = new AuthApiError(
      'User already registered',
      400,
      'user_already_exists',
    )

    expect(extractAuthFormError(error)).toEqual({
      message: AUTH_ERROR_FALLBACK_MESSAGE,
      code: 'SUPABASE_AUTH_ERROR',
      kind: 'operational',
    })
    expect(mockClientLogError).toHaveBeenCalledWith(
      'auth-form-error',
      'Supabase auth error',
      { supabaseCode: 'user_already_exists' },
    )
  })

  it('should return generic fault kind for non-auth errors', () => {
    expect(extractAuthFormError(new Error('Something broke'))).toEqual({
      message:
        'Something went wrong on our end. Please try again, or contact support if it continues.',
      code: 'INTERNAL_ERROR',
      kind: 'fault',
    })
    expect(mockClientLogError).toHaveBeenCalledWith(
      'auth-form-error',
      'Non-auth error',
      { message: 'Something broke' },
    )
  })

  it('should return generic fault kind with fallback message for unknown values', () => {
    expect(extractAuthFormError(null)).toEqual({
      message:
        'Something went wrong on our end. Please try again, or contact support if it continues.',
      code: 'INTERNAL_ERROR',
      kind: 'fault',
    })
    expect(mockClientLogError).toHaveBeenCalledWith(
      'auth-form-error',
      'Non-auth error',
      { message: 'An error occurred' },
    )
  })
})
