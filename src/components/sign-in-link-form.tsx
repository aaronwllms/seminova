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
import Link from 'next/link'
import { useState } from 'react'

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

  const loginHref = next
    ? `/auth/login?${new URLSearchParams({ next }).toString()}`
    : '/auth/login'

  const handleSendSignInLink = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setFormError(null)

    try {
      const options: {
        shouldCreateUser: true
        emailRedirectTo?: string
      } = { shouldCreateUser: true }

      if (next && isUsableRedirectNext(next, window.location.origin)) {
        options.emailRedirectTo = `${window.location.origin}${next}`
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options,
      })
      if (error) throw error
      setSuccess(true)
    } catch (caught: unknown) {
      setFormError(extractAuthFormError(caught, { email }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle asChild>
            <h1 className="text-2xl">
              {success ? 'Check Your Email' : 'Sign in with email'}
            </h1>
          </CardTitle>
          <CardDescription>
            {success
              ? 'Sign-in link sent'
              : "Enter your email and we'll send you a link to sign in"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <p className="text-muted-foreground text-sm">
              We sent a sign-in link to {email}. Open the email and follow the
              link to continue.
            </p>
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
