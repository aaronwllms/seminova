'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { ProfileFormValues } from '@/app/(app)/_lib/profile/profile-form-schema'

import { ProfileSettingsDialog } from './profile-settings-dialog'

type ProfileDialogProfile = {
  userId: string
  email: string
  hasPassword: boolean
  profileLoadFailed: boolean
  defaultValues: ProfileFormValues
}

type ProfileDialogContextValue = {
  openProfile: () => void
}

type ProfileDialogOpenContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const ProfileDialogContext = createContext<ProfileDialogContextValue | null>(
  null,
)

const ProfileDialogOpenContext =
  createContext<ProfileDialogOpenContextValue | null>(null)

export const useProfileDialog = () => {
  const context = useContext(ProfileDialogContext)

  if (!context) {
    throw new Error(
      'useProfileDialog must be used within ProfileDialogProvider',
    )
  }

  return context
}

const useProfileDialogOpen = () => {
  const context = useContext(ProfileDialogOpenContext)

  if (!context) {
    throw new Error(
      'ProfileDialogBinder must be used within ProfileDialogProvider',
    )
  }

  return context
}

type ProfileDialogProviderProps = {
  children: ReactNode
}

export const ProfileDialogProvider = ({
  children,
}: ProfileDialogProviderProps) => {
  const [open, setOpen] = useState(false)
  const openProfile = useCallback(() => setOpen(true), [])
  const value = useMemo(() => ({ openProfile }), [openProfile])
  const openValue = useMemo(() => ({ open, setOpen }), [open, setOpen])

  return (
    <ProfileDialogOpenContext.Provider value={openValue}>
      <ProfileDialogContext.Provider value={value}>
        {children}
      </ProfileDialogContext.Provider>
    </ProfileDialogOpenContext.Provider>
  )
}

export const ProfileDialogBinder = ({
  userId,
  email,
  hasPassword,
  profileLoadFailed,
  defaultValues,
}: ProfileDialogProfile) => {
  const { open, setOpen } = useProfileDialogOpen()

  return (
    <ProfileSettingsDialog
      open={open}
      onOpenChange={setOpen}
      userId={userId}
      email={email}
      hasPassword={hasPassword}
      profileLoadFailed={profileLoadFailed}
      defaultValues={defaultValues}
    />
  )
}
