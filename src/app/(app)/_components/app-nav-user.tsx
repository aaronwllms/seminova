'use client'

import { LayoutDashboard, LogOut, User } from 'lucide-react'
import Link from 'next/link'

import { useProfileDialog } from '@/app/(app)/_components/profile/profile-dialog-provider'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { APP_HOME } from '@/constants/app-paths'
import { ADMIN_HOME } from '@/constants/admin-paths'
import { useSignOut } from '@/hooks/use-sign-out'

type AppNavUserProps = {
  displayName: string | null
  avatarUrl: string | null
  email: string
  isAdmin: boolean
  showOpenApp?: boolean
}

export const AppNavUser = ({
  displayName,
  avatarUrl,
  email,
  isAdmin,
  showOpenApp = false,
}: AppNavUserProps) => {
  const handleSignOut = useSignOut()
  const { openProfile } = useProfileDialog()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink rounded-full"
          aria-label="Account menu"
        >
          <UserAvatar
            displayName={displayName}
            email={email}
            avatarUrl={avatarUrl}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuItem onSelect={openProfile}>
          <User />
          Profile
        </DropdownMenuItem>
        {showOpenApp ? (
          <DropdownMenuItem asChild>
            <Link href={APP_HOME}>
              <LayoutDashboard />
              Open app
            </Link>
          </DropdownMenuItem>
        ) : null}
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link href={ADMIN_HOME}>
              <LayoutDashboard />
              Admin console
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
