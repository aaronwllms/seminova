'use client'

import { ProfileDialogProvider } from '@/app/(app)/_components/profile/profile-dialog-provider'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { cn } from '@/utils/tailwind'

import { AdminBreadcrumb } from './admin-breadcrumb'
import { AdminSidebar } from './admin-sidebar'

type AdminShellProps = {
  children: React.ReactNode
  userId: string
  email: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  profileLoadFailed: boolean
  defaultSidebarOpen?: boolean
}

export const AdminShell = ({
  children,
  userId,
  email,
  displayName,
  bio,
  avatarUrl,
  profileLoadFailed,
  defaultSidebarOpen,
}: AdminShellProps) => {
  return (
    <ProfileDialogProvider
      userId={userId}
      email={email}
      profileLoadFailed={profileLoadFailed}
      defaultValues={{ displayName, bio, avatarUrl }}
    >
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        <AdminSidebar
          email={email}
          displayName={displayName}
          avatarUrl={avatarUrl}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <AdminBreadcrumb />
            </div>
          </header>
          <div className={cn('flex flex-1 flex-col gap-4 p-4 pt-0')}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProfileDialogProvider>
  )
}
