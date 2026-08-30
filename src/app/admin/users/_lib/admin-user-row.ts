import { BAN_PERMANENCE_THRESHOLD_MS } from '@/constants/admin-ban'
import { isAdminFromAppMetadata } from '@/utils/admin'
import { isUserCurrentlyBanned } from '@/utils/is-user-currently-banned'

export const USERS_SORT_COLUMNS = [
  'email',
  'email_confirmed_at',
  'created_at',
  'last_sign_in_at',
  'role',
  'banned_until',
] as const

export type UsersSortColumn = (typeof USERS_SORT_COLUMNS)[number]

export const USERS_SORT_DIRECTIONS = ['asc', 'desc'] as const

export type UsersSortDirection = (typeof USERS_SORT_DIRECTIONS)[number]

export const USERS_SEARCH_MIN_LENGTH = 3

export const USERS_EMAIL_FILTER_MAX_LENGTH = 200

export const SEARCHABLE_COLUMN = 'email' as const

export type BanStatus = null | { permanent: true } | { until: Date }

export interface AdminUserRpcRow {
  id: string
  email: string | null
  email_confirmed_at: string | null
  created_at: string | null
  last_sign_in_at: string | null
  app_metadata: Record<string, unknown> | null
  banned_until: string | null
}

export interface AdminUserRow {
  id: string
  email: string
  isVerified: boolean
  createdAtLabel: string
  lastSignInAtLabel: string
  isAdmin: boolean
  banStatus: BanStatus
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const formatDateLabel = (value: string | undefined | null): string => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return dateFormatter.format(date)
}

export const formatBanUntilLabel = (date: Date): string =>
  dateFormatter.format(date)

export const deriveBanStatus = (
  bannedUntil: string | null,
  now: Date = new Date(),
): BanStatus => {
  if (!isUserCurrentlyBanned(bannedUntil, now)) {
    return null
  }

  const until = new Date(bannedUntil!)

  if (until.getTime() - now.getTime() > BAN_PERMANENCE_THRESHOLD_MS) {
    return { permanent: true }
  }

  return { until }
}

export const mapUserToAdminRow = (row: AdminUserRpcRow): AdminUserRow => ({
  id: row.id,
  email: row.email ?? '—',
  isVerified: Boolean(row.email_confirmed_at),
  createdAtLabel: formatDateLabel(row.created_at),
  lastSignInAtLabel: formatDateLabel(row.last_sign_in_at),
  isAdmin: isAdminFromAppMetadata(row.app_metadata ?? {}),
  banStatus: deriveBanStatus(row.banned_until),
})
