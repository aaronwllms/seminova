import { Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

import { getCurrentUserProfile } from '@/app/(app)/_lib/get-current-user-profile'

import { ProfilePageClient } from './_components/profile-page-client'

const ProfilePageSkeleton = () => (
  <div className="flex w-full flex-col gap-8">
    <div className="space-y-2">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-64" />
    </div>
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-48 w-full" />
  </div>
)

const ProfilePageContent = async () => {
  const profile = await getCurrentUserProfile()

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings.
        </p>
      </div>
      <ProfilePageClient
        userId={profile.userId}
        email={profile.email}
        defaultValues={{
          displayName: profile.displayName,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
        }}
      />
    </>
  )
}

export default function ProfilePage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Suspense fallback={<ProfilePageSkeleton />}>
        <ProfilePageContent />
      </Suspense>
    </div>
  )
}
