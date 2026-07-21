import { USERS_SEARCH_MIN_LENGTH } from './admin-user-row'

export interface UserListFilters {
  filterUnverified: boolean
  filterBanned: boolean
  filterNew30d: boolean
  search: string | null
}

export type UserListFilterChipId = 'unverified' | 'banned' | 'new30d' | 'search'

export interface UserListFilterChip {
  id: UserListFilterChipId
  label: string
}

const isAppliedSearch = (search: string | null): search is string =>
  search !== null && search.trim().length >= USERS_SEARCH_MIN_LENGTH

const truncateFilterDisplay = (value: string): string =>
  value.length > 20 ? `${value.slice(0, 17)}…` : value

export const hasActiveUserListFilters = (filters: UserListFilters): boolean =>
  filters.filterUnverified ||
  filters.filterBanned ||
  filters.filterNew30d ||
  isAppliedSearch(filters.search)

export const buildUserListFilterChips = (
  filters: UserListFilters,
): UserListFilterChip[] => {
  const chips: UserListFilterChip[] = []

  if (filters.filterUnverified) {
    chips.push({ id: 'unverified', label: 'Unverified' })
  }

  if (filters.filterBanned) {
    chips.push({ id: 'banned', label: 'Banned' })
  }

  if (filters.filterNew30d) {
    chips.push({ id: 'new30d', label: 'New (30d)' })
  }

  if (isAppliedSearch(filters.search)) {
    const trimmed = filters.search.trim()
    chips.push({
      id: 'search',
      label: `Email: ${truncateFilterDisplay(trimmed)}`,
    })
  }

  return chips
}

export const buildUserListFilterLabels = (filters: UserListFilters): string[] =>
  buildUserListFilterChips(filters).map((chip) => chip.label)
