'use client'

import { useState } from 'react'

import { setFirstPasswordAction } from '@/app/(app)/_lib/profile/actions'
import { AppErrorSurface } from '@/components/app-error-surface'
import { InlineError } from '@/components/inline-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MIN_PASSWORD_LENGTH } from '@/constants/auth'
import { createClient } from '@/supabase/client'
import type { AppError } from '@/types/app-error'
import { showSuccessToast } from '@/utils/app-toast'
import { extractAuthFormError } from '@/utils/extract-auth-form-error'

type ProfilePasswordSectionProps = {
  email: string
  hasPassword: boolean
  onSuccess?: () => void
}

export const ProfilePasswordSection = ({
  email,
  hasPassword,
  onSuccess,
}: ProfilePasswordSectionProps) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [formError, setFormError] = useState<AppError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const resetForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setValidationError(null)
    setFormError(null)
  }

  const validatePasswordFields = (): boolean => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setValidationError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      )
      return false
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return false
    }

    return true
  }

  const handleChangePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setValidationError(null)
    setFormError(null)

    if (!validatePasswordFields()) {
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        current_password: currentPassword,
      })

      if (error) {
        throw error
      }

      showSuccessToast('Password updated')
      resetForm()
      onSuccess?.()
    } catch (caught: unknown) {
      setFormError(extractAuthFormError(caught))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFirstPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setValidationError(null)
    setFormError(null)

    if (!validatePasswordFields()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await setFirstPasswordAction({ password: newPassword })

      if (!result.success) {
        setFormError(result.error)
        return
      }

      showSuccessToast('Password set')
      resetForm()
      onSuccess?.()
    } catch (caught: unknown) {
      setFormError(extractAuthFormError(caught))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = hasPassword
    ? handleChangePasswordSubmit
    : handleFirstPasswordSubmit

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        name="username"
        autoComplete="username"
        value={email}
        readOnly
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
      {hasPassword ? (
        <div className="grid gap-2">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="new-password">
          {hasPassword ? 'New password' : 'Password'}
        </Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">
          {hasPassword ? 'Confirm new password' : 'Confirm password'}
        </Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>
      {validationError ? <InlineError message={validationError} /> : null}
      <AppErrorSurface error={formError} />
      <Button type="submit" disabled={isLoading}>
        {isLoading
          ? hasPassword
            ? 'Updating…'
            : 'Setting…'
          : hasPassword
            ? 'Update password'
            : 'Set password'}
      </Button>
    </form>
  )
}
