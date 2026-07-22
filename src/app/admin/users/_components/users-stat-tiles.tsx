'use client'

import { StatTile } from '@/components/stat-tile'
import { Skeleton } from '@/components/ui/skeleton'

import type { AdminUserStats } from '../_lib/list-admin-user-stats'

interface UsersStatTilesProps {
  stats: AdminUserStats | null
  isFullyUnfiltered: boolean
  filterUnverified: boolean
  filterBanned: boolean
  filterNew30d: boolean
  isLoading: boolean
  onTotalClick: () => void
  onUnverifiedToggle: () => void
  onBannedToggle: () => void
  onNew30dToggle: () => void
}

export const UsersStatTiles = ({
  stats,
  isFullyUnfiltered,
  filterUnverified,
  filterBanned,
  filterNew30d,
  isLoading,
  onTotalClick,
  onUnverifiedToggle,
  onBannedToggle,
  onNew30dToggle,
}: UsersStatTilesProps) => {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
        aria-busy="true"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[3.625rem] rounded-xl" />
        ))}
      </div>
    )
  }

  const counts = stats ?? {
    total: 0,
    unverified: 0,
    banned: 0,
    new30d: 0,
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      <StatTile
        label="Total"
        count={counts.total}
        role="total"
        selected={isFullyUnfiltered}
        tooltip="Clear all filters"
        onClick={onTotalClick}
      />
      <StatTile
        label="Unverified"
        count={counts.unverified}
        role="total"
        selected={filterUnverified}
        tooltip="Show unverified users only"
        onClick={onUnverifiedToggle}
      />
      <StatTile
        label="Banned"
        count={counts.banned}
        role="total"
        selected={filterBanned}
        tooltip="Show banned users only"
        onClick={onBannedToggle}
      />
      <StatTile
        label="New (30d)"
        count={counts.new30d}
        role="total"
        selected={filterNew30d}
        tooltip="Show users created in the last 30 days"
        onClick={onNew30dToggle}
      />
    </div>
  )
}
