'use client'

import { LayoutDashboard, LogOut, User } from 'lucide-react'
import Link from 'next/link'

import { useProfileDialog } from '@/app/(app)/_components/profile/profile-dialog-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ADMIN_HOME } from '@/constants/admin-paths'
import { useSignOut } from '@/hooks/use-sign-out'
import { cn } from '@/utils/tailwind'
import { getProfileInitials } from '@/utils/user-initials'

type AppNavUserProps = {
  displayName: string | null
  avatarUrl: string | null
  email: string
  isAdmin: boolean
}

export const AppNavUser = ({
  displayName,
  avatarUrl,
  email,
  isAdmin,
}: AppNavUserProps) => {
  const handleSignOut = useSignOut()
  const { openProfile } = useProfileDialog()
  const initials = getProfileInitials({ displayName, email })
  const accountLabel = displayName ?? email

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'max-w-full min-w-0 shrink rounded-full',
            'md:h-8 md:w-auto md:max-w-full md:justify-start md:px-2',
          )}
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8 shrink-0">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 truncate md:inline">
            {accountLabel}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuItem onSelect={openProfile}>
          <User />
          Profile
        </DropdownMenuItem>
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
