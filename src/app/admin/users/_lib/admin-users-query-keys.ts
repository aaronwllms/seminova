export const adminUsersQueryKeys = {
  all: ['admin-users'] as const,
  list: (page: number, emailFilter: string | undefined) =>
    ['admin-users', 'list', { page, emailFilter }] as const,
}
