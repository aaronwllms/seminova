import { describe, expect, it } from 'vitest'

import {
  buildReferenceListFilterChips,
  hasActiveReferenceListFilters,
} from './reference-list-filters'

describe('reference-list-filters', () => {
  it('should treat empty filters as inactive', () => {
    expect(
      hasActiveReferenceListFilters({
        statuses: [],
        search: null,
      }),
    ).toBe(false)
  })

  it('should detect active status and search filters', () => {
    expect(
      hasActiveReferenceListFilters({
        statuses: ['Held'],
        search: null,
      }),
    ).toBe(true)

    expect(
      hasActiveReferenceListFilters({
        statuses: [],
        search: 'harbor',
      }),
    ).toBe(true)
  })

  it('should build chips for active filters', () => {
    expect(
      buildReferenceListFilterChips({
        statuses: ['Cleared', 'In transit'],
        search: 'Harborlight Transit',
      }),
    ).toEqual([
      { id: 'Cleared', label: 'Cleared' },
      { id: 'In transit', label: 'In transit' },
      { id: 'search', label: 'Consignee: Harborlight Transit' },
    ])
  })
})
