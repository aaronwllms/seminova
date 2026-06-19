import type { User } from '@supabase/supabase-js'

import { isAdminFromAppMetadata } from '@/utils/admin'

export const USERS_PAGE_SIZE = 50

export const USERS_SEARCH_MIN_LENGTH = 3

export const SEARCHABLE_COLUMN = 'email' as const

export interface AdminUserRow {
  id: string
  email: string
  isVerified: boolean
  createdAtLabel: string
  lastSignInAtLabel: string
  isAdmin: boolean
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

export const mapUserToAdminRow = (user: User): AdminUserRow => ({
  id: user.id,
  email: user.email ?? '—',
  isVerified: Boolean(user.email_confirmed_at),
  createdAtLabel: formatDateLabel(user.created_at),
  lastSignInAtLabel: formatDateLabel(user.last_sign_in_at),
  isAdmin: isAdminFromAppMetadata(user.app_metadata),
})
