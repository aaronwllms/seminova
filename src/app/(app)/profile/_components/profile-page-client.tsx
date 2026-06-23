'use client'

import { useRouter } from 'next/navigation'

import { ThemeSwitcher } from '@/components/theme-switcher'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { AppError } from '@/types/app-error'
import { showSuccessToast } from '@/utils/app-toast'

import { updateProfileAction } from '../actions'
import type { ProfileFormValues } from '../_lib/profile-form-schema'
import { ProfilePasswordSection } from './profile-password-section'
import { ProfileSettingsForm } from './profile-settings-form'

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
  const router = useRouter()

  const handleSubmit = async (
    values: ProfileFormValues,
  ): Promise<AppError | null> => {
    const result = await updateProfileAction(values)

    if (!result.success) {
      return result.error
    }

    showSuccessToast('Profile saved')
    router.refresh()
    return null
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your display name, photo, and bio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm
            userId={userId}
            email={email}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfilePasswordSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Choose light, dark, or system theme for the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSwitcher />
        </CardContent>
      </Card>
    </div>
  )
}
