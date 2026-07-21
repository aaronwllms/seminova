import { ActiveFilterChips } from '@/components/active-filter-chips'

import {
  buildUserListFilterChips,
  type UserListFilters,
} from '../_lib/user-list-filters'

interface UsersActiveFiltersProps {
  filters: UserListFilters
  onRemove: (id: string) => void
  onClearAll: () => void
}

export const UsersActiveFilters = ({
  filters,
  onRemove,
  onClearAll,
}: UsersActiveFiltersProps) => (
  <ActiveFilterChips
    chips={buildUserListFilterChips(filters)}
    onRemove={onRemove}
    onClearAll={onClearAll}
  />
)
