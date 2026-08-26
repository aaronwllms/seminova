import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { isSafeUrlScheme } from '@/utils/is-safe-url-scheme'
import { cn } from '@/utils/tailwind'
import { getProfileInitials } from '@/utils/user-initials'

type UserAvatarProps = {
  displayName: string | null
  email: string
  avatarUrl: string | null
  alt?: string
  previewSrc?: string | null
  className?: string
  fallbackClassName?: string
}

export const UserAvatar = ({
  displayName,
  email,
  avatarUrl,
  alt,
  previewSrc,
  className,
  fallbackClassName,
}: UserAvatarProps) => {
  const initials = getProfileInitials({ displayName, email })
  const imageSrc =
    previewSrc ?? (avatarUrl && isSafeUrlScheme(avatarUrl) ? avatarUrl : null)

  return (
    <Avatar className={cn('h-8 w-8 shrink-0 rounded-full', className)}>
      {imageSrc ? (
        <AvatarImage
          src={imageSrc}
          alt={alt ?? ''}
          role={alt ? undefined : 'presentation'}
        />
      ) : null}
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  )
}
