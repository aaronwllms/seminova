import { Badge } from '@/components/ui/badge'

import {
  buildUserListFilterLabels,
  hasActiveUserListFilters,
  type UserListFilters,
} from '../_lib/user-list-filters'

interface UsersActiveFiltersProps {
  filters: UserListFilters
}

export const UsersActiveFilters = ({ filters }: UsersActiveFiltersProps) => {
  if (!hasActiveUserListFilters(filters)) {
    return null
  }

  const labels = buildUserListFilterLabels(filters)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-sm">Active filters:</span>
      {labels.map((label) => (
        <Badge key={label} variant="secondary">
          {label}
        </Badge>
      ))}
    </div>
  )
}
