'use client'

import { ChevronsUpDown, LayoutDashboard, LogOut, User } from 'lucide-react'
import Link from 'next/link'

import { ThemeDropdownMenuItems } from '@/components/theme-dropdown-menu-items'
import { UserAvatar } from '@/components/user-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useProfileDialog } from '@/app/(app)/_components/profile/profile-dialog-provider'
import { APP_HOME } from '@/constants/app-paths'
import { useSignOut } from '@/hooks/use-sign-out'

type AdminNavUserProps = {
  displayName: string | null
  avatarUrl: string | null
  email: string
}

export const AdminNavUser = ({
  displayName,
  avatarUrl,
  email,
}: AdminNavUserProps) => {
  const { isMobile } = useSidebar()
  const handleSignOut = useSignOut()
  const { openProfile } = useProfileDialog()
  const accountLabel = displayName ?? email

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar
                displayName={displayName}
                email={email}
                avatarUrl={avatarUrl}
                className="h-8 w-8 rounded-lg"
                fallbackClassName="rounded-lg"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-xs">{accountLabel}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-52 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2 text-left text-sm">
                <UserAvatar
                  displayName={displayName}
                  email={email}
                  avatarUrl={avatarUrl}
                  className="h-8 w-8 rounded-lg"
                  fallbackClassName="rounded-lg"
                />
                <span className="text-xs">{accountLabel}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={openProfile}>
              <User />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={APP_HOME}>
                <LayoutDashboard />
                Open app
              </Link>
            </DropdownMenuItem>
            <ThemeDropdownMenuItems />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
