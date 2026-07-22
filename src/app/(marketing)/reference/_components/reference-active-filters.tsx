import { ActiveFilterChips } from '@/components/active-filter-chips'

import {
  buildReferenceListFilterChips,
  type ReferenceListFilters,
} from '../_lib/reference-list-filters'

interface ReferenceActiveFiltersProps {
  filters: ReferenceListFilters
  onRemove: (id: string) => void
  onClearAll: () => void
}

export const ReferenceActiveFilters = ({
  filters,
  onRemove,
  onClearAll,
}: ReferenceActiveFiltersProps) => (
  <ActiveFilterChips
    chips={buildReferenceListFilterChips(filters)}
    onRemove={onRemove}
    onClearAll={onClearAll}
  />
)
