import { Button } from '@/components/ui/button'

interface UsersFilteredEmptyStateProps {
  onResetFilters: () => void
  onRefresh: () => void
  isRefreshing: boolean
}

export const UsersFilteredEmptyState = ({
  onResetFilters,
  onRefresh,
  isRefreshing,
}: UsersFilteredEmptyStateProps) => (
  <div className="flex flex-col items-center gap-3 py-2">
    <p>No users found for selected filters</p>
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button type="button" onClick={onResetFilters}>
        Reset filters
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={isRefreshing}
        onClick={onRefresh}
      >
        Refresh
      </Button>
    </div>
  </div>
)
