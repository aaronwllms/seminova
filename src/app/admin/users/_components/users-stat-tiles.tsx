'use client'

import { StatTile } from '@/components/stat-tile'

import type { AdminUserStats } from '../_lib/list-admin-user-stats'

interface UsersStatTilesProps {
  stats: AdminUserStats | null
  filterUnverified: boolean
  filterBanned: boolean
  onTotalClick: () => void
  onUnverifiedToggle: () => void
  onBannedToggle: () => void
}

export const UsersStatTiles = ({
  stats,
  filterUnverified,
  filterBanned,
  onTotalClick,
  onUnverifiedToggle,
  onBannedToggle,
}: UsersStatTilesProps) => {
  const counts = stats ?? {
    total: 0,
    unverified: 0,
    banned: 0,
  }
  const isUnfiltered = !filterUnverified && !filterBanned

  return (
    <div className="grid grid-cols-3 gap-2">
      <StatTile
        label="Total"
        count={counts.total}
        role="total"
        selected={isUnfiltered}
        tooltip="Clear all filters"
        onClick={onTotalClick}
      />
      <StatTile
        label="Unverified"
        count={counts.unverified}
        role="warn"
        selected={filterUnverified}
        onClick={onUnverifiedToggle}
      />
      <StatTile
        label="Banned"
        count={counts.banned}
        role="error"
        selected={filterBanned}
        onClick={onBannedToggle}
      />
    </div>
  )
}
