import type { LogListFilters } from './log-list-filters'
import type { AppLogCursor } from './app-log-row'
import type { LogsSortDirection } from './app-log-row'

export const adminLogsQueryKeys = {
  all: ['admin-logs'] as const,
  lists: () => ['admin-logs', 'list'] as const,
  list: (
    cursor: AppLogCursor | null | undefined,
    sortDirection: LogsSortDirection,
    perPage: number,
    filters: LogListFilters,
  ) =>
    [
      ...adminLogsQueryKeys.lists(),
      { cursor: cursor ?? null, sortDirection, perPage, filters },
    ] as const,
  stats: () => ['admin-logs', 'stats'] as const,
  tags: () => ['admin-logs', 'tags'] as const,
}
