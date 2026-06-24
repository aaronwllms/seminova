export const getEmailInitials = (email: string): string => {
  const localPart = email.split('@')[0] ?? ''
  const parts = localPart.split(/[._-]/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }

  return localPart.slice(0, 2).toUpperCase() || '?'
}

type GetProfileInitialsParams = {
  displayName: string | null
  email: string
}

export const getProfileInitials = ({
  displayName,
  email,
}: GetProfileInitialsParams): string => {
  const trimmed = displayName?.trim()
  if (trimmed) {
    const words = trimmed.split(/\s+/).filter(Boolean)
    if (words.length >= 2) {
      return `${words[0]![0] ?? ''}${words[1]![0] ?? ''}`.toUpperCase()
    }
    return trimmed.slice(0, 2).toUpperCase() || '?'
  }

  return getEmailInitials(email)
}
