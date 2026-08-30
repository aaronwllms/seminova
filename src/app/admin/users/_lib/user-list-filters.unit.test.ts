import { describe, expect, it } from 'vitest'

import { USERS_SEARCH_MIN_LENGTH } from './admin-user-row'
import {
  buildUserListFilterChips,
  hasActiveUserListFilters,
} from './user-list-filters'

describe('hasActiveUserListFilters', () => {
  it('should return false when no filters are active', () => {
    expect(
      hasActiveUserListFilters({
        filterUnverified: false,
        filterBanned: false,
        filterNew30d: false,
        search: null,
      }),
    ).toBe(false)
  })

  it('should return true when any tile filter is active', () => {
    expect(
      hasActiveUserListFilters({
        filterUnverified: true,
        filterBanned: false,
        filterNew30d: false,
        search: null,
      }),
    ).toBe(true)

    expect(
      hasActiveUserListFilters({
        filterUnverified: false,
        filterBanned: false,
        filterNew30d: true,
        search: null,
      }),
    ).toBe(true)
  })

  it('should treat search as active only at the minimum length', () => {
    expect(
      hasActiveUserListFilters({
        filterUnverified: false,
        filterBanned: false,
        filterNew30d: false,
        search: 'a'.repeat(USERS_SEARCH_MIN_LENGTH - 1),
      }),
    ).toBe(false)

    expect(
      hasActiveUserListFilters({
        filterUnverified: false,
        filterBanned: false,
        filterNew30d: false,
        search: 'a'.repeat(USERS_SEARCH_MIN_LENGTH),
      }),
    ).toBe(true)
  })
})

describe('buildUserListFilterChips', () => {
  it('should return one chip per active filter with stable ids', () => {
    expect(
      buildUserListFilterChips({
        filterUnverified: true,
        filterBanned: false,
        filterNew30d: true,
        search: 'alice@example.com',
      }),
    ).toEqual([
      { id: 'unverified', label: 'Unverified' },
      { id: 'new30d', label: 'New (30d)' },
      { id: 'search', label: 'Email: alice@example.com' },
    ])
  })

  it('should truncate long search chip labels', () => {
    const longSearch = 'a'.repeat(25)

    expect(
      buildUserListFilterChips({
        filterUnverified: false,
        filterBanned: false,
        filterNew30d: false,
        search: longSearch,
      }),
    ).toEqual([{ id: 'search', label: `Email: ${'a'.repeat(17)}…` }])
  })
})
