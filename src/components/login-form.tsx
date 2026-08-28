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
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { getPostAuthRedirectPath } from '@/utils/admin'
import { extractAuthFormError } from '@/utils/extract-auth-form-error'
import { isSafeRedirect } from '@/utils/is-safe-redirect'
import type { AppError } from '@/types/app-error'

type LoginFormProps = React.ComponentPropsWithoutRef<'div'> & {
  next?: string | null
}

export function LoginForm({ next, className, ...props }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<AppError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Password managers write to the DOM and often auto-submit without React
    // onChange. Read the live fields so we don't send empty/stale state.
    const formData = new FormData(e.currentTarget)
    const submittedEmail = String(formData.get('username') ?? '')
    const submittedPassword = String(formData.get('password') ?? '')
    setEmail(submittedEmail)
    setPassword(submittedPassword)

    const supabase = createClient()
    setIsLoading(true)
    setFormError(null)

    try {
      // Drop any stale session cookies before establishing a new one.
      await supabase.auth.signOut({ scope: 'local' })

      const { data, error } = await supabase.auth.signInWithPassword({
        email: submittedEmail,
        password: submittedPassword,
      })
      if (error) throw error
      router.refresh()
      const destination =
        next && isSafeRedirect(next, window.location.origin)
          ? next
          : getPostAuthRedirectPath(data.user?.app_metadata)
      router.push(destination)
    } catch (caught: unknown) {
      setFormError(extractAuthFormError(caught, { email: submittedEmail }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle asChild>
            <h1 className="text-2xl">Sign in</h1>
          </CardTitle>
          <CardDescription>
            Enter your email below to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="username"
                  type="email"
                  autoComplete="username"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    prefetch={false}
                    className="ml-auto inline-block text-sm underline underline-offset-4"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suppressHydrationWarning
                />
              </div>
              <AppErrorSurface error={formError} />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card text-muted-foreground px-2">or</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link
                  href={
                    next
                      ? `/auth/sign-in-link?${new URLSearchParams({ next }).toString()}`
                      : '/auth/sign-in-link'
                  }
                  prefetch={false}
                >
                  Email me a sign-in link
                </Link>
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/sign-up"
                prefetch={false}
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
