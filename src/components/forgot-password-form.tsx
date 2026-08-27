'use client'

import { cn } from '@/utils/tailwind'
import { createClient } from '@/supabase/client'
import { AppErrorSurface } from '@/components/app-error-surface'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

import {
  AUTH_OTP_CODE_LENGTH,
  AUTH_OTP_LIFETIME_MINUTES,
  AUTH_OTP_MIN_SEND_INTERVAL_SECONDS,
} from '@/constants/auth'
import { extractAuthFormError } from '@/utils/extract-auth-form-error'
import type { AppError } from '@/types/app-error'

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<AppError | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpInputKey, setOtpInputKey] = useState(0)
  const [lastSentAt, setLastSentAt] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()

  const clearOtpInput = useCallback(() => {
    setOtpValue('')
    setOtpInputKey((key) => key + 1)
  }, [])

  useEffect(() => {
    if (countdown <= 0) return

    const id = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(id)
  }, [countdown])

  useLayoutEffect(() => {
    return () => {
      setEmail('')
      setFormError(null)
      setSuccess(false)
      setIsLoading(false)
      setIsVerifying(false)
      setIsResending(false)
      setOtpValue('')
      setOtpInputKey((key) => key + 1)
      setLastSentAt(null)
      setCountdown(0)
    }
  }, [])

  const sendResetEmail = async (targetEmail: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) throw error

    setLastSentAt(Date.now())
    setCountdown(AUTH_OTP_MIN_SEND_INTERVAL_SECONDS)
    clearOtpInput()
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError(null)

    try {
      await sendResetEmail(email)
      setSuccess(true)
    } catch (caught: unknown) {
      setFormError(extractAuthFormError(caught, { email }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyComplete = async (token: string) => {
    if (isVerifying) return

    setIsVerifying(true)
    setFormError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
      })
      if (error) throw error

      router.refresh()
      router.push('/auth/update-password')
    } catch (caught: unknown) {
      const otpExpired =
        lastSentAt !== null &&
        Date.now() - lastSentAt > AUTH_OTP_LIFETIME_MINUTES * 60 * 1000
      setFormError(extractAuthFormError(caught, { email, otpExpired }))
      clearOtpInput()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || isResending) return

    setIsResending(true)
    setFormError(null)

    try {
      await sendResetEmail(email)
    } catch (caught: unknown) {
      setFormError(extractAuthFormError(caught, { email }))
    } finally {
      setIsResending(false)
    }
  }

  const handleUseDifferentEmail = () => {
    setSuccess(false)
    setFormError(null)
    clearOtpInput()
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle asChild>
            <h1 className="text-2xl">
              {success ? 'Complete password reset' : 'Reset Your Password'}
            </h1>
          </CardTitle>
          <CardDescription>
            {success
              ? 'Use the link or code from your email'
              : "Type in your email and we'll send you a link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col gap-6">
              <p className="text-muted-foreground text-sm">
                If you registered using your email and password, you will
                receive a password reset email. If you received an email, enter
                the code below, or follow the link instead.
              </p>
              <InputOTP
                key={otpInputKey}
                maxLength={AUTH_OTP_CODE_LENGTH}
                value={otpValue}
                onChange={setOtpValue}
                onComplete={handleVerifyComplete}
                disabled={isVerifying}
                autoFocus
                autoComplete="one-time-code"
              >
                <InputOTPGroup>
                  {Array.from({ length: AUTH_OTP_CODE_LENGTH }, (_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <AppErrorSurface error={formError} />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={countdown > 0 || isResending}
                onClick={handleResend}
              >
                {isResending
                  ? 'Sending...'
                  : countdown > 0
                    ? `Resend code (${countdown}s)`
                    : 'Resend code'}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={handleUseDifferentEmail}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <AppErrorSurface error={formError} />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send reset email'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  prefetch={false}
                  className="underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
