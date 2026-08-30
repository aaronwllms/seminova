'use client'

import { StatTile } from '@/components/stat-tile'
import { Skeleton } from '@/components/ui/skeleton'
import { LOG_LEVELS, type LogLevel } from '@/types/app-settings'

import type { AppLogStats } from '../_lib/list-app-log-stats'

interface LogsStatTilesProps {
  stats: AppLogStats | null
  isFullyUnfiltered: boolean
  selectedLevels: LogLevel[]
  unreadOnly: boolean
  isLoading: boolean
  onTotalClick: () => void
  onLevelToggle: (level: LogLevel) => void
  onUnreadToggle: () => void
}

export const LogsStatTiles = ({
  stats,
  isFullyUnfiltered,
  selectedLevels,
  unreadOnly,
  isLoading,
  onTotalClick,
  onLevelToggle,
  onUnreadToggle,
}: LogsStatTilesProps) => {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
        aria-busy="true"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[3.625rem] rounded-xl" />
        ))}
      </div>
    )
  }

  const counts = stats ?? {
    total: 0,
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    unread: 0,
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <StatTile
        label="Total"
        count={counts.total}
        role="total"
        selected={isFullyUnfiltered}
        tooltip="Clear all filters"
        onClick={onTotalClick}
      />
      {LOG_LEVELS.map((level) => (
        <StatTile
          key={level}
          label={level.charAt(0).toUpperCase() + level.slice(1)}
          count={counts[level]}
          role={level}
          selected={selectedLevels.includes(level)}
          onClick={() => onLevelToggle(level)}
        />
      ))}
      <StatTile
        label="Unread"
        count={counts.unread}
        role="unread"
        selected={unreadOnly}
        onClick={onUnreadToggle}
      />
    </div>
  )
}
