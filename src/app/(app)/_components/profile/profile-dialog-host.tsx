// New shells that mount this host must register in _lib/profile/revalidate-profile-dialog-hosts.ts.
import { Suspense, type ReactNode } from 'react'

import { ProfileDialogProvider } from './profile-dialog-provider'
import { ProfileDialogTree } from './profile-dialog-tree'

type ProfileDialogHostProps = {
  children: ReactNode
}

export const ProfileDialogHost = ({ children }: ProfileDialogHostProps) => {
  return (
    <ProfileDialogProvider>
      {children}
      <Suspense fallback={null}>
        <ProfileDialogTree />
      </Suspense>
    </ProfileDialogProvider>
  )
}
