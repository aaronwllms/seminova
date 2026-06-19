export const getEmailInitials = (email: string): string => {
  const localPart = email.split('@')[0] ?? ''
  const parts = localPart.split(/[._-]/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }

  return localPart.slice(0, 2).toUpperCase() || '?'
}
