import { AuthApiError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import { AUTH_ERROR_FALLBACK_MESSAGE, mapAuthError } from './map-auth-error'

describe('mapAuthError', () => {
  it('should map invalid_credentials to sanitized copy', () => {
    const error = new AuthApiError(
      'Invalid login credentials',
      400,
      'invalid_credentials',
    )

    expect(mapAuthError(error)).toEqual({
      mapped: true,
      error: {
        message: 'Invalid email or password.',
        code: 'SUPABASE_AUTH_ERROR',
        kind: 'operational',
      },
    })
  })

  it('should map weak_password to VALIDATION_ERROR', () => {
    const error = new AuthApiError('Password too weak', 400, 'weak_password')

    expect(mapAuthError(error)).toEqual({
      mapped: true,
      error: {
        message:
          "Your password doesn't meet the strength requirements. Please choose a stronger one.",
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
  })

  it('should map unexpected_failure to INTERNAL_ERROR fault', () => {
    const error = new AuthApiError(
      'Unexpected failure',
      500,
      'unexpected_failure',
    )

    expect(mapAuthError(error)).toEqual({
      mapped: true,
      error: {
        message:
          'Something went wrong on our end. Please try again, or contact support if it continues.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })
  })

  it('should map otp_expired to mismatch copy when otpExpired is false', () => {
    const error = new AuthApiError('OTP has expired', 403, 'otp_expired')

    expect(mapAuthError(error, { otpExpired: false })).toEqual({
      mapped: true,
      error: {
        message: "That code didn't match. Please try again.",
        code: 'SUPABASE_AUTH_ERROR',
        kind: 'operational',
      },
    })
  })

  it('should map otp_expired to expired copy when otpExpired is true', () => {
    const error = new AuthApiError('OTP has expired', 403, 'otp_expired')

    expect(mapAuthError(error, { otpExpired: true })).toEqual({
      mapped: true,
      error: {
        message: 'That code has expired. Please request a new one.',
        code: 'SUPABASE_AUTH_ERROR',
        kind: 'operational',
      },
    })
  })

  it('should default otp_expired to mismatch copy when otpExpired is absent', () => {
    const error = new AuthApiError('OTP has expired', 403, 'otp_expired')

    expect(mapAuthError(error)).toEqual({
      mapped: true,
      error: {
        message: "That code didn't match. Please try again.",
        code: 'SUPABASE_AUTH_ERROR',
        kind: 'operational',
      },
    })
  })

  it('should map user_banned to suspension copy', () => {
    const error = new AuthApiError('User is banned', 403, 'user_banned')

    expect(mapAuthError(error)).toEqual({
      mapped: true,
      error: {
        message:
          'Your account has been suspended. Contact support if you believe this is a mistake.',
        code: 'SUPABASE_AUTH_ERROR',
        kind: 'operational',
      },
    })
  })

  it('should fold email_not_confirmed into invalid credentials copy', () => {
    const error = new AuthApiError(
      'Email not confirmed',
      400,
      'email_not_confirmed',
    )

    expect(mapAuthError(error)).toEqual({
      mapped: true,
      error: {
        message: 'Invalid email or password.',
        code: 'SUPABASE_AUTH_ERROR',
        kind: 'operational',
      },
    })
  })

  it('should leave user_already_exists unmapped', () => {
    const error = new AuthApiError(
      'User already registered',
      400,
      'user_already_exists',
    )

    expect(mapAuthError(error)).toEqual({
      mapped: false,
      error: {
        message: AUTH_ERROR_FALLBACK_MESSAGE,
        code: 'SUPABASE_AUTH_ERROR',
        kind: 'operational',
      },
    })
  })

  it('should return generic fault for non-auth errors', () => {
    expect(mapAuthError(new Error('Something broke'))).toEqual({
      mapped: false,
      error: {
        message:
          'Something went wrong on our end. Please try again, or contact support if it continues.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })
  })

  it('should return generic fault for unknown values', () => {
    expect(mapAuthError(null)).toEqual({
      mapped: false,
      error: {
        message:
          'Something went wrong on our end. Please try again, or contact support if it continues.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })
  })
})
