'use client'

import { useState } from 'react'

import { ErrorPanel } from '@/components/error-panel'
import { InlineError } from '@/components/inline-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/supabase/client'
import type { AppError } from '@/types/app-error'
import { extractAuthFormError } from '@/utils/extract-auth-form-error'

const MIN_PASSWORD_LENGTH = 6

export const ProfilePasswordSection = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [formError, setFormError] = useState<AppError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setValidationError(null)
    setFormError(null)
    setSuccessMessage(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setValidationError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      )
      return
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      setPassword('')
      setConfirmPassword('')
      setSuccessMessage('Password updated.')
    } catch (caught: unknown) {
      setFormError(extractAuthFormError(caught))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>
      {validationError ? <InlineError message={validationError} /> : null}
      {formError?.kind === 'fault' ? (
        <ErrorPanel message={formError.message} code={formError.code} />
      ) : formError ? (
        <InlineError message={formError.message} />
      ) : null}
      {successMessage ? (
        <p className="text-muted-foreground text-sm" role="status">
          {successMessage}
        </p>
      ) : null}
      <Button type="submit" variant="outline" disabled={isLoading}>
        {isLoading ? 'Updating…' : 'Change password'}
      </Button>
    </form>
  )
}
