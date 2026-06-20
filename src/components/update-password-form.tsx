'use client'

import { cn } from '@/utils/tailwind'
import { createClient } from '@/supabase/client'
import { ErrorPanel } from '@/components/error-panel'
import { InlineError } from '@/components/inline-error'
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
import { useState } from 'react'

import { getPostAuthRedirectPath, type AppMetadata } from '@/utils/admin'
import { extractAuthFormError } from '@/utils/extract-auth-form-error'
import type { AppError } from '@/types/app-error'

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<AppError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setFormError(null)

    try {
      const { data, error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      router.push(
        getPostAuthRedirectPath(data.user?.app_metadata as AppMetadata),
      )
    } catch (caught: unknown) {
      setFormError(extractAuthFormError(caught))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {formError?.kind === 'fault' ? (
                <ErrorPanel message={formError.message} code={formError.code} />
              ) : formError ? (
                <InlineError message={formError.message} />
              ) : null}
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
