import type { AppLogCursor } from './app-log-row'
import type { LogsSortDirection } from './app-log-row'

export const adminLogsQueryKeys = {
  all: ['admin-logs'] as const,
  list: (
    cursor: AppLogCursor | null | undefined,
    sortDirection: LogsSortDirection,
    perPage: number,
  ) =>
    [
      'admin-logs',
      'list',
      { cursor: cursor ?? null, sortDirection, perPage },
    ] as const,
}
