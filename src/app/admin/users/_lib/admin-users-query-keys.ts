import type { UsersSortColumn, UsersSortDirection } from './admin-user-row'

export const adminUsersQueryKeys = {
  all: ['admin-users'] as const,
  list: (
    page: number,
    emailFilter: string | undefined,
    sortColumn: UsersSortColumn,
    sortDirection: UsersSortDirection,
    perPage: number,
    filterUnverified: boolean,
    filterBanned: boolean,
    filterNew30d: boolean,
  ) =>
    [
      'admin-users',
      'list',
      {
        page,
        emailFilter,
        sortColumn,
        sortDirection,
        perPage,
        filterUnverified,
        filterBanned,
        filterNew30d,
      },
    ] as const,
  stats: () => ['admin-users', 'stats'] as const,
}
