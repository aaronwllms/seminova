'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

import type { ProfileFormValues } from '@/app/(app)/_lib/profile/profile-form-schema'

import { ProfileSettingsDialog } from './profile-settings-dialog'

type ProfileDialogProfile = {
  userId: string
  email: string
  profileLoadFailed: boolean
  defaultValues: ProfileFormValues
}

type ProfileDialogContextValue = {
  openProfile: () => void
}

const ProfileDialogContext = createContext<ProfileDialogContextValue | null>(
  null,
)

export const useProfileDialog = () => {
  const context = useContext(ProfileDialogContext)

  if (!context) {
    throw new Error(
      'useProfileDialog must be used within ProfileDialogProvider',
    )
  }

  return context
}

type ProfileDialogProviderProps = ProfileDialogProfile & {
  children: ReactNode
}

export const ProfileDialogProvider = ({
  children,
  userId,
  email,
  profileLoadFailed,
  defaultValues,
}: ProfileDialogProviderProps) => {
  const [open, setOpen] = useState(false)

  return (
    <ProfileDialogContext.Provider value={{ openProfile: () => setOpen(true) }}>
      {children}
      <ProfileSettingsDialog
        open={open}
        onOpenChange={setOpen}
        userId={userId}
        email={email}
        profileLoadFailed={profileLoadFailed}
        defaultValues={defaultValues}
      />
    </ProfileDialogContext.Provider>
  )
}
