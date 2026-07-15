import type { UsersSortColumn, UsersSortDirection } from './admin-user-row'

export const adminUsersQueryKeys = {
  all: ['admin-users'] as const,
  list: (
    page: number,
    emailFilter: string | undefined,
    sortColumn: UsersSortColumn,
    sortDirection: UsersSortDirection,
    perPage: number,
    showBanned: boolean,
  ) =>
    [
      'admin-users',
      'list',
      { page, emailFilter, sortColumn, sortDirection, perPage, showBanned },
    ] as const,
}
