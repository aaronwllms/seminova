export const ADMIN_BAN_DURATIONS = [
  '1h',
  '24h',
  '168h',
  '720h',
  '876000h',
] as const

export type AdminBanDuration = (typeof ADMIN_BAN_DURATIONS)[number]

export const ADMIN_UNBAN_DURATION = 'none' as const

/** ~10 years — bans beyond this are displayed as permanent. */
export const BAN_PERMANENCE_THRESHOLD_MS = 10 * 365.25 * 24 * 60 * 60 * 1000

export const ADMIN_BAN_DURATION_LABELS: Record<AdminBanDuration, string> = {
  '1h': '1 hour',
  '24h': '24 hours',
  '168h': '7 days',
  '720h': '30 days',
  '876000h': 'Permanent',
}

export const isAdminBanDuration = (value: string): value is AdminBanDuration =>
  (ADMIN_BAN_DURATIONS as readonly string[]).includes(value)
