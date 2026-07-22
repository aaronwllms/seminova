import type { ShipmentStatus } from './reference-shipment'

export interface ReferenceListFilters {
  statuses: ShipmentStatus[]
  search: string | null
}

export type ReferenceListFilterChipId = ShipmentStatus | 'search'

export interface ReferenceListFilterChip {
  id: ReferenceListFilterChipId
  label: string
}

const truncateFilterDisplay = (value: string): string =>
  value.length > 20 ? `${value.slice(0, 17)}…` : value

export const hasActiveReferenceListFilters = (
  filters: ReferenceListFilters,
): boolean =>
  filters.statuses.length > 0 ||
  (filters.search !== null && filters.search.trim().length > 0)

export const buildReferenceListFilterChips = (
  filters: ReferenceListFilters,
): ReferenceListFilterChip[] => {
  const chips: ReferenceListFilterChip[] = []

  for (const status of filters.statuses) {
    chips.push({ id: status, label: status })
  }

  if (filters.search !== null && filters.search.trim().length > 0) {
    const trimmed = filters.search.trim()
    chips.push({
      id: 'search',
      label: `Consignee: ${truncateFilterDisplay(trimmed)}`,
    })
  }

  return chips
}
