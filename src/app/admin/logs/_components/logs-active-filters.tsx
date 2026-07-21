import { ActiveFilterChips } from '@/components/active-filter-chips'

import {
  buildLogListFilterChips,
  type LogListFilters,
} from '../_lib/log-list-filters'

interface LogsActiveFiltersProps {
  filters: LogListFilters
  onRemove: (id: string) => void
  onClearAll: () => void
}

export const LogsActiveFilters = ({
  filters,
  onRemove,
  onClearAll,
}: LogsActiveFiltersProps) => (
  <ActiveFilterChips
    chips={buildLogListFilterChips(filters)}
    onRemove={onRemove}
    onClearAll={onClearAll}
  />
)
