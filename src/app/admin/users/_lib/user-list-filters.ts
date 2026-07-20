import { USERS_SEARCH_MIN_LENGTH } from './admin-user-row'

export interface UserListFilters {
  filterUnverified: boolean
  filterBanned: boolean
  filterNew30d: boolean
  search: string | null
}

const isAppliedSearch = (search: string | null): search is string =>
  search !== null && search.trim().length >= USERS_SEARCH_MIN_LENGTH

export const hasActiveUserListFilters = (filters: UserListFilters): boolean =>
  filters.filterUnverified ||
  filters.filterBanned ||
  filters.filterNew30d ||
  isAppliedSearch(filters.search)

export const buildUserListFilterLabels = (
  filters: UserListFilters,
): string[] => {
  const labels: string[] = []

  if (filters.filterUnverified) {
    labels.push('Unverified')
  }

  if (filters.filterBanned) {
    labels.push('Banned')
  }

  if (filters.filterNew30d) {
    labels.push('New (30d)')
  }

  if (isAppliedSearch(filters.search)) {
    const trimmed = filters.search.trim()
    const display = trimmed.length > 20 ? `${trimmed.slice(0, 17)}…` : trimmed
    labels.push(`Email: ${display}`)
  }

  return labels
}
