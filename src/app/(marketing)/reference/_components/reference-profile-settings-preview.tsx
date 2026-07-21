'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { ProfileAvatarField } from '@/app/(app)/_components/profile/profile-avatar-field'
import { ProfileThemeSegment } from '@/app/(app)/_components/profile/profile-theme-segment'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { AppErrorSurface } from '@/components/app-error-surface'
import { BlurSaveTextField } from '@/components/blur-save-text-field'
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
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useBlurSaveField } from '@/hooks/use-blur-save-field'
import { usePasswordAccordionScroll } from '@/hooks/use-password-accordion-scroll'
import type { FieldSaveState } from '@/types/field-save-state'
import { showSuccessToast } from '@/utils/app-toast'

import {
  referenceDemoFormInputSchema,
  type ReferenceDemoFormInputValues,
  type ReferenceDemoPartialValues,
} from '../_lib/reference-demo-form-schema'
import { referenceDemoPersist } from '../_lib/reference-demo-persist'

const DEFAULT_VALUES: ReferenceDemoFormInputValues = {
  displayName: 'Aaron Williams',
  bio: 'Building thoughtful interfaces.',
}

const DEMO_EMAIL = 'demo@example.com'
const DEMO_AVATAR_URL = '/images/aw-avatar.jpg'
const MIN_PASSWORD_LENGTH = 6
const PASSWORD_ACCORDION_VALUE = 'password'

type ReferenceLastSaved = {
  displayName: string | null
  bio: string | null
}

export const ReferenceProfileSettingsPreview = () => {
  const [open, setOpen] = useState(false)
  const { passwordSectionRef, handleAccordionValueChange } =
    usePasswordAccordionScroll()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(DEMO_AVATAR_URL)
  const [avatarSaveState, setAvatarSaveState] = useState<FieldSaveState>('idle')
  const [avatarFileError, setAvatarFileError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [passwordSubmitAttempted, setPasswordSubmitAttempted] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)

  const form = useForm<ReferenceDemoFormInputValues>({
    resolver: zodResolver(referenceDemoFormInputSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const { saveStates, formError, createTextBlurHandler } = useBlurSaveField<
    ReferenceDemoFormInputValues,
    'displayName' | 'bio',
    'displayName' | 'bio',
    ReferenceLastSaved,
    ReferenceDemoPartialValues
  >({
    form,
    inFlightKeys: ['displayName', 'bio'] as const,
    initialLastSaved: {
      displayName: DEFAULT_VALUES.displayName.trim() || null,
      bio: DEFAULT_VALUES.bio.trim() || null,
    },
    persist: referenceDemoPersist,
    faultFallbackMessage: 'Could not save. Please try again.',
  })

  const watchedDisplayName = useWatch({
    control: form.control,
    name: 'displayName',
  })

  const handleDisplayNameBlur = createTextBlurHandler('displayName', {
    refresh: false,
    toPayload: (trimmed) => ({ displayName: trimmed }),
    lastSaved: {
      get: (snapshot) => snapshot.displayName,
      set: (snapshot, value) => {
        snapshot.displayName = value
      },
    },
  })

  const handleBioBlur = createTextBlurHandler('bio', {
    refresh: false,
    toPayload: (trimmed) => ({ bio: trimmed }),
    lastSaved: {
      get: (snapshot) => snapshot.bio,
      set: (snapshot, value) => {
        snapshot.bio = value
      },
    },
  })

  const handleAvatarUpload = async (file: File) => {
    setAvatarSaveState('saving')

    setAvatarUrl((previousUrl) => {
      if (previousUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previousUrl)
      }

      return URL.createObjectURL(file)
    })
    setAvatarSaveState('saved')
  }

  const handleAvatarRemove = async () => {
    setAvatarSaveState('saving')

    setAvatarUrl((previousUrl) => {
      if (previousUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previousUrl)
      }

      return null
    })
    setAvatarSaveState('idle')
  }

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPasswordSubmitAttempted(true)
    setValidationError(null)

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

    setIsSubmittingPassword(true)

    showSuccessToast('Password updated')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordSubmitAttempted(false)
    setIsSubmittingPassword(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Preview profile settings</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            Demo only — local mock handlers; nothing is stored.
          </DialogDescription>
        </DialogHeader>

        <div className="flex w-full flex-col gap-6">
          <Form {...form}>
            <div className="flex flex-col gap-6">
              <ProfileAvatarField
                avatarUrl={avatarUrl}
                displayName={watchedDisplayName || null}
                email={DEMO_EMAIL}
                saveState={avatarSaveState}
                onSavedComplete={() => setAvatarSaveState('idle')}
                onUpload={handleAvatarUpload}
                onRemove={handleAvatarRemove}
                fileError={avatarFileError}
                onFileError={setAvatarFileError}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BlurSaveTextField
                  control={form.control}
                  name="displayName"
                  label="Display name"
                  placeholder="Your display name"
                  controlType="input"
                  saveState={saveStates.displayName}
                  onSavedComplete={() => undefined}
                  onBlurSave={handleDisplayNameBlur}
                />

                <div className="flex flex-col gap-2">
                  <Label htmlFor="reference-demo-email">Email</Label>
                  <Input
                    id="reference-demo-email"
                    value={DEMO_EMAIL}
                    readOnly
                    autoComplete="username"
                    className="text-muted-foreground focus-visible:border-input cursor-default focus-visible:ring-0"
                  />
                </div>
              </div>

              <BlurSaveTextField
                control={form.control}
                name="bio"
                label="Bio"
                placeholder="A short bio"
                description="Brief description for your profile. Max 160 characters."
                controlType="textarea"
                saveState={saveStates.bio}
                onSavedComplete={() => undefined}
                onBlurSave={handleBioBlur}
              />

              <AppErrorSurface error={formError} />
            </div>
          </Form>

          <Separator className="bg-border/40" />

          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-medium">Appearance</h2>
              <p className="text-muted-foreground text-sm">
                Choose light, dark, or system theme for the app.
              </p>
            </div>
            <ProfileThemeSegment />
          </section>

          <Separator className="bg-border/40" />

          <Accordion
            type="single"
            collapsible
            onValueChange={handleAccordionValueChange}
          >
            <div ref={passwordSectionRef}>
              <AccordionItem
                value={PASSWORD_ACCORDION_VALUE}
                className="border-none"
              >
                <AccordionTrigger className="hover:bg-muted px-2 hover:no-underline">
                  Change Password
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <form
                    onSubmit={handlePasswordSubmit}
                    className="flex flex-col gap-4"
                  >
                    <input
                      type="email"
                      name="username"
                      autoComplete="username"
                      value={DEMO_EMAIL}
                      readOnly
                      tabIndex={-1}
                      aria-hidden
                      className="sr-only"
                    />
                    <div className="grid gap-2">
                      <Label htmlFor="reference-current-password">
                        Current password
                      </Label>
                      <Input
                        id="reference-current-password"
                        type="password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(event) =>
                          setCurrentPassword(event.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reference-new-password">
                        New password
                      </Label>
                      <Input
                        id="reference-new-password"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reference-confirm-password">
                        Confirm new password
                      </Label>
                      <Input
                        id="reference-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                      />
                    </div>
                    {passwordSubmitAttempted && validationError ? (
                      <InlineError message={validationError} />
                    ) : null}
                    <Button type="submit" disabled={isSubmittingPassword}>
                      {isSubmittingPassword ? 'Updating…' : 'Update password'}
                    </Button>
                  </form>
                </AccordionContent>
              </AccordionItem>
            </div>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  )
}
