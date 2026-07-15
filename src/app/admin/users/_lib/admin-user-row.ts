import { isAdminFromAppMetadata } from '@/utils/admin'

export const USERS_SORT_COLUMNS = [
  'email',
  'email_confirmed_at',
  'created_at',
  'last_sign_in_at',
  'role',
] as const

export type UsersSortColumn = (typeof USERS_SORT_COLUMNS)[number]

export const USERS_SORT_DIRECTIONS = ['asc', 'desc'] as const

export type UsersSortDirection = (typeof USERS_SORT_DIRECTIONS)[number]

export const USERS_SEARCH_MIN_LENGTH = 3

export const SEARCHABLE_COLUMN = 'email' as const

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
  bannedUntil: string | null
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatDateLabel = (value: string | undefined | null): string => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return dateFormatter.format(date)
}

export const mapUserToAdminRow = (row: AdminUserRpcRow): AdminUserRow => ({
  id: row.id,
  email: row.email ?? '—',
  isVerified: Boolean(row.email_confirmed_at),
  createdAtLabel: formatDateLabel(row.created_at),
  lastSignInAtLabel: formatDateLabel(row.last_sign_in_at),
  isAdmin: isAdminFromAppMetadata(row.app_metadata ?? {}),
  bannedUntil: row.banned_until,
})
