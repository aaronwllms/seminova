'use client'

import { ErrorPanel } from '@/components/error-panel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { ProfileFormValues } from '@/app/(app)/_lib/profile/profile-form-schema'

import { ProfileModalContent } from './profile-modal-content'

type ProfileSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  email: string
  profileLoadFailed: boolean
  defaultValues: ProfileFormValues
}

export const ProfileSettingsDialog = ({
  open,
  onOpenChange,
  userId,
  email,
  profileLoadFailed,
  defaultValues,
}: ProfileSettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>Manage your account settings.</DialogDescription>
        </DialogHeader>
        {profileLoadFailed ? (
          <ErrorPanel message="We couldn't load your profile. Try refreshing the page." />
        ) : null}
        <ProfileModalContent
          userId={userId}
          email={email}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  )
}
