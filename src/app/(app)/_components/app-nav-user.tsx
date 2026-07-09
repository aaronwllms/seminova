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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            openProfile()
          }}
        >
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
