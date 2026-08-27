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
import { getPostAuthRedirectPath } from '@/utils/admin'
import { extractAuthFormError } from '@/utils/extract-auth-form-error'
import { isUsableRedirectNext } from '@/utils/is-safe-redirect'
import type { AppError } from '@/types/app-error'

type SignInLinkFormProps = React.ComponentPropsWithoutRef<'div'> & {
  next?: string | null
}

export function SignInLinkForm({
  next,
  className,
  ...props
}: SignInLinkFormProps) {
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

  const loginHref = next
    ? `/auth/login?${new URLSearchParams({ next }).toString()}`
    : '/auth/login'

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

  const buildSignInLinkOptions = () => {
    const options: {
      shouldCreateUser: true
      emailRedirectTo?: string
    } = { shouldCreateUser: true }

    if (next && isUsableRedirectNext(next, window.location.origin)) {
      options.emailRedirectTo = `${window.location.origin}${next}`
    }

    return options
  }

  const sendSignInLink = async (targetEmail: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: buildSignInLinkOptions(),
    })
    if (error) throw error

    setLastSentAt(Date.now())
    setCountdown(AUTH_OTP_MIN_SEND_INTERVAL_SECONDS)
    clearOtpInput()
  }

  const handleSendSignInLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError(null)

    try {
      await sendSignInLink(email)
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
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })
      if (error) throw error

      router.refresh()
      const destination =
        next && isUsableRedirectNext(next, window.location.origin)
          ? next
          : getPostAuthRedirectPath(data.user?.app_metadata)
      router.push(destination)
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
      await sendSignInLink(email)
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
              {success ? 'Complete sign-in' : 'Sign in with email'}
            </h1>
          </CardTitle>
          <CardDescription>
            {success
              ? 'Use the link or code from your email'
              : "Enter your email and we'll send you a link to sign in"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col gap-6">
              <p className="text-muted-foreground text-sm">
                We sent a sign-in link to {email}. Enter the code from that
                email below, or follow the link instead.
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
            <form onSubmit={handleSendSignInLink}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <AppErrorSurface error={formError} />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send sign-in link'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Prefer password sign-in?{' '}
                <Link href={loginHref} className="underline underline-offset-4">
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
