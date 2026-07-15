import type { UsersSortColumn, UsersSortDirection } from './admin-user-row'

export const adminUsersQueryKeys = {
  all: ['admin-users'] as const,
  list: (
    page: number,
    emailFilter: string | undefined,
    sortColumn: UsersSortColumn,
    sortDirection: UsersSortDirection,
    perPage: number,
  ) =>
    [
      'admin-users',
      'list',
      { page, emailFilter, sortColumn, sortDirection, perPage },
    ] as const,
}
