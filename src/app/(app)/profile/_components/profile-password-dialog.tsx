'use client'

import { useState } from 'react'

import { ErrorPanel } from '@/components/error-panel'
import { InlineError } from '@/components/inline-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/supabase/client'
import type { AppError } from '@/types/app-error'
import { showSuccessToast } from '@/utils/app-toast'
import { extractAuthFormError } from '@/utils/extract-auth-form-error'

const MIN_PASSWORD_LENGTH = 6

type ProfilePasswordDialogProps = {
  email: string
}

export const ProfilePasswordDialog = ({
  email,
}: ProfilePasswordDialogProps) => {
  const [open, setOpen] = useState(false)
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

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      resetForm()
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setValidationError(null)
    setFormError(null)

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setValidationError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      )
      return
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.')
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
      setOpen(false)
    } catch (caught: unknown) {
      setFormError(extractAuthFormError(caught))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Change password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
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
          <div className="grid gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
