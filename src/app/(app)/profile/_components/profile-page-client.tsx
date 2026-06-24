'use client'

import { Separator } from '@/components/ui/separator'

import type { ProfileFormValues } from '../_lib/profile-form-schema'
import { ProfilePasswordDialog } from './profile-password-dialog'
import { ProfileSettingsForm } from './profile-settings-form'
import { ProfileThemeSegment } from './profile-theme-segment'

type ProfilePageClientProps = {
  userId: string
  email: string
  defaultValues: ProfileFormValues
}

export const ProfilePageClient = ({
  userId,
  email,
  defaultValues,
}: ProfilePageClientProps) => {
  return (
    <div className="flex w-full max-w-prose flex-col gap-8">
      <section className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Update your display name, photo, and bio.
        </p>
        <ProfileSettingsForm
          userId={userId}
          email={email}
          defaultValues={defaultValues}
        />
      </section>

      <Separator className="bg-border/40" />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Password</h2>
          <p className="text-muted-foreground text-sm">
            Change your account password.
          </p>
        </div>
        <ProfilePasswordDialog email={email} />
      </section>

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
    </div>
  )
}
