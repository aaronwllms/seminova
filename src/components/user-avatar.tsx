import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/tailwind'
import { getProfileInitials } from '@/utils/user-initials'

type UserAvatarProps = {
  displayName: string | null
  email: string
  avatarUrl: string | null
  className?: string
  fallbackClassName?: string
  imageAlt?: string
}

export const UserAvatar = ({
  displayName,
  email,
  avatarUrl,
  className,
  fallbackClassName,
  imageAlt = '',
}: UserAvatarProps) => {
  const initials = getProfileInitials({ displayName, email })

  return (
    <Avatar className={cn('h-8 w-8 shrink-0 rounded-full', className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={imageAlt} /> : null}
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  )
}
