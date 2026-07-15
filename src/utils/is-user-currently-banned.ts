export const isUserCurrentlyBanned = (
  bannedUntil: string | null | undefined,
  now: Date = new Date(),
): boolean => {
  if (!bannedUntil) {
    return false
  }

  const until = new Date(bannedUntil)

  return !Number.isNaN(until.getTime()) && until.getTime() > now.getTime()
}
