'use client'

import { cn } from '@/utils/tailwind'
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
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

import {
  AUTH_OTP_CODE_LENGTH,
  AUTH_OTP_LIFETIME_MINUTES,
  AUTH_OTP_MIN_SEND_INTERVAL_SECONDS,
} from '@/constants/auth'
import { extractAuthFormError } from '@/utils/extract-auth-form-error'
import type { AppError } from '@/types/app-error'

interface EmailOtpRequestCardProps extends React.ComponentPropsWithoutRef<'div'> {
  send: (email: string) => Promise<void>
  verify: (email: string, token: string) => Promise<string>
  title: string
  successTitle: string
  description: string
  successDescription: string
  successBody: (email: string) => React.ReactNode
  submitLabel: string
  footer: React.ReactNode
}

export function EmailOtpRequestCard({
  send,
  verify,
  title,
  successTitle,
  description,
  successDescription,
  successBody,
  submitLabel,
  footer,
  className,
  ...props
}: EmailOtpRequestCardProps) {
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

  const sendAndResetCountdown = async (targetEmail: string) => {
    await send(targetEmail)
    setLastSentAt(Date.now())
    setCountdown(AUTH_OTP_MIN_SEND_INTERVAL_SECONDS)
    clearOtpInput()
  }

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError(null)

    try {
      await sendAndResetCountdown(email)
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
      const destination = await verify(email, token)
      router.refresh()
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
      await sendAndResetCountdown(email)
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
            <h1 className="text-2xl">{success ? successTitle : title}</h1>
          </CardTitle>
          <CardDescription>
            {success ? successDescription : description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col gap-6">
              {successBody(email)}
              <InputOTP
                key={otpInputKey}
                maxLength={AUTH_OTP_CODE_LENGTH}
                value={otpValue}
                onChange={setOtpValue}
                onComplete={handleVerifyComplete}
                disabled={isVerifying}
                autoFocus
                autoComplete="one-time-code"
                data-1p-ignore
                data-lpignore="true"
                pushPasswordManagerStrategy="none"
                containerClassName="w-fit self-center"
              >
                <InputOTPGroup>
                  {Array.from({ length: AUTH_OTP_CODE_LENGTH }, (_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="size-10"
                    />
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
            <form onSubmit={handleRequest}>
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
                  {isLoading ? 'Sending...' : submitLabel}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">{footer}</div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
