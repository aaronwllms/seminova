import { isAuthError } from '@supabase/supabase-js'

import type { AppError } from '@/types/app-error'

export const AUTH_ERROR_FALLBACK_MESSAGE =
  "We couldn't complete that request. Please try again, or contact support if the problem continues."

const AUTH_ERROR_OVERRIDES: Record<string, AppError> = {
  invalid_credentials: {
    message: 'Invalid email or password.',
    code: 'SUPABASE_AUTH_ERROR',
    kind: 'operational',
  },
  email_not_confirmed: {
    message: 'Invalid email or password.',
    code: 'SUPABASE_AUTH_ERROR',
    kind: 'operational',
  },
  weak_password: {
    message:
      "Your password doesn't meet the strength requirements. Please choose a stronger one.",
    code: 'VALIDATION_ERROR',
    kind: 'operational',
  },
  same_password: {
    message: 'Your new password must be different from your current one.',
    code: 'VALIDATION_ERROR',
    kind: 'operational',
  },
  over_email_send_rate_limit: {
    message: 'Too many emails sent. Please wait a few minutes and try again.',
    code: 'RATE_LIMITED',
    kind: 'operational',
  },
  over_request_rate_limit: {
    message:
      'Too many attempts. Please wait a few minutes before trying again.',
    code: 'RATE_LIMITED',
    kind: 'operational',
  },
  session_expired: {
    message: 'Your session has expired. Please sign in again.',
    code: 'SESSION_EXPIRED',
    kind: 'operational',
  },
  email_address_invalid: {
    message: 'Please enter a valid email address.',
    code: 'VALIDATION_ERROR',
    kind: 'operational',
  },
  user_banned: {
    message:
      'Your account has been suspended. Contact support if you believe this is a mistake.',
    code: 'SUPABASE_AUTH_ERROR',
    kind: 'operational',
  },
  unexpected_failure: {
    message:
      'Something went wrong on our end. Please try again, or contact support if it continues.',
    code: 'INTERNAL_ERROR',
    kind: 'fault',
  },
}

const OTP_EXPIRED_OVERRIDES = {
  mismatch: {
    message: "That code didn't match. Please try again.",
    code: 'SUPABASE_AUTH_ERROR',
    kind: 'operational',
  },
  expired: {
    message: 'That code has expired. Please request a new one.',
    code: 'SUPABASE_AUTH_ERROR',
    kind: 'operational',
  },
} as const satisfies Record<string, AppError>

export interface MapAuthErrorOptions {
  otpExpired?: boolean
}

export interface MapAuthErrorResult {
  error: AppError
  mapped: boolean
}

export const mapAuthError = (
  caught: unknown,
  options?: MapAuthErrorOptions,
): MapAuthErrorResult => {
  if (isAuthError(caught) && typeof caught.code === 'string') {
    if (caught.code === 'otp_expired') {
      const variant = options?.otpExpired ? 'expired' : 'mismatch'
      return { error: { ...OTP_EXPIRED_OVERRIDES[variant] }, mapped: true }
    }

    const override = AUTH_ERROR_OVERRIDES[caught.code]

    if (override) {
      return { error: { ...override }, mapped: true }
    }

    return {
      error: {
        message: AUTH_ERROR_FALLBACK_MESSAGE,
        code: 'SUPABASE_AUTH_ERROR',
        kind: 'operational',
      },
      mapped: false,
    }
  }

  return {
    error: {
      message:
        'Something went wrong on our end. Please try again, or contact support if it continues.',
      code: 'INTERNAL_ERROR',
      kind: 'fault',
    },
    mapped: false,
  }
}
