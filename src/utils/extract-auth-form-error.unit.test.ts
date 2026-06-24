import { AuthApiError } from '@supabase/supabase-js'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  AUTH_ERROR_FALLBACK_MESSAGE,
  extractAuthFormError,
} from './extract-auth-form-error'

describe('extractAuthFormError', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should map invalid_credentials to sanitized copy without logging', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
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
    expect(consoleError).not.toHaveBeenCalled()
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

  it('should fall back for unmapped auth codes and log supabaseCode', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new AuthApiError('OTP has expired', 400, 'otp_expired')

    expect(extractAuthFormError(error)).toEqual({
      message: AUTH_ERROR_FALLBACK_MESSAGE,
      code: 'SUPABASE_AUTH_ERROR',
      kind: 'operational',
    })
    expect(error.message).not.toEqual(AUTH_ERROR_FALLBACK_MESSAGE)
    expect(consoleError).toHaveBeenCalledWith(
      '[extract-auth-form-error] Supabase auth error',
      { supabaseCode: 'otp_expired' },
    )
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
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
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
    expect(consoleError).toHaveBeenCalledWith(
      '[extract-auth-form-error] Supabase auth error',
      { supabaseCode: 'user_already_exists' },
    )
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
