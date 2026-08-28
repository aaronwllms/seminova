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
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { completeRecoveryPasswordAction } from '@/app/(app)/_lib/profile/actions'
import { MIN_PASSWORD_LENGTH } from '@/constants/auth'
import type { AppError } from '@/types/app-error'
import { clientLog } from '@/utils/client-logger'

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [password, setPassword] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [emailLookupFailed, setEmailLookupFailed] = useState(false)
  const [formError, setFormError] = useState<AppError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth
      .getUser()
      .then(({ data: { user }, error }) => {
        if (error || !user?.email) {
          clientLog.error(
            'auth-form-error',
            'Could not resolve account email',
            {
              error,
            },
          )
          setEmailLookupFailed(true)
          return
        }
        setAccountEmail(user.email)
      })
      .catch((caught: unknown) => {
        clientLog.error(
          'auth-form-error',
          'Could not resolve account email',
          caught,
        )
        setEmailLookupFailed(true)
      })
  }, [])

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Password managers write to the DOM and often auto-submit without React
    // onChange. Read the live fields so we don't send empty/stale state.
    const formData = new FormData(e.currentTarget)
    const submittedPassword = String(formData.get('password') ?? '')
    setPassword(submittedPassword)

    setIsLoading(true)
    setFormError(null)

    if (submittedPassword.length < MIN_PASSWORD_LENGTH) {
      setFormError({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        kind: 'operational',
      })
      setIsLoading(false)
      return
    }

    try {
      const result = await completeRecoveryPasswordAction({
        password: submittedPassword,
      })

      if (!result.success) {
        setFormError(result.error)
        return
      }

      router.refresh()
      router.push(result.data.redirectTo)
    } catch {
      setFormError({
        message:
          'Something went wrong on our end. Please try again, or contact support if it continues.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle asChild>
            <h1 className="text-2xl">Reset Your Password</h1>
          </CardTitle>
          <CardDescription>
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              {!emailLookupFailed ? (
                <input
                  type="email"
                  name="username"
                  autoComplete="username"
                  value={accountEmail}
                  readOnly
                  tabIndex={-1}
                  aria-hidden
                  className="sr-only"
                />
              ) : null}
              {emailLookupFailed ? (
                <p className="text-muted-foreground text-sm" role="status">
                  Couldn&apos;t confirm your email. Your password will still be
                  saved, but your password manager may not update the stored
                  login.
                </p>
              ) : null}
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <AppErrorSurface error={formError} />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save new password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
