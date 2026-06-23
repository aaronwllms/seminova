'use client'

import { LogOut, User } from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PROFILE_PATH } from '@/constants/app-paths'
import { useSignOut } from '@/hooks/use-sign-out'
import { getProfileInitials } from '@/utils/user-initials'

type AppNavUserProps = {
  displayName: string | null
  avatarUrl: string | null
  email: string
}

export const AppNavUser = ({
  displayName,
  avatarUrl,
  email,
}: AppNavUserProps) => {
  const handleSignOut = useSignOut()
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
        <DropdownMenuItem asChild>
          <Link href={PROFILE_PATH}>
            <User />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
