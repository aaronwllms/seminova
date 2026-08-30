import { z } from 'zod'

import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
} from '@/constants/data-table'

import {
  USERS_EMAIL_FILTER_MAX_LENGTH,
  USERS_SORT_COLUMNS,
  USERS_SORT_DIRECTIONS,
} from './admin-user-row'

const [pageSize10, pageSize15, pageSize25, pageSize50] =
  DATA_TABLE_PAGE_SIZE_OPTIONS

const perPageSchema = z.union(
  [
    z.literal(pageSize10),
    z.literal(pageSize15),
    z.literal(pageSize25),
    z.literal(pageSize50),
  ],
  { error: 'Page size must be 10, 15, 25, or 50' },
)

export const listUsersActionInputSchema = z.object({
  page: z
    .number({ error: 'Page must be a positive integer' })
    .int('Page must be a positive integer')
    .min(1, 'Page must be a positive integer')
    .default(1),
  perPage: perPageSchema.default(DATA_TABLE_DEFAULT_PAGE_SIZE),
  sortColumn: z
    .enum(USERS_SORT_COLUMNS, { error: 'Invalid sort column' })
    .default('created_at'),
  sortDirection: z
    .enum(USERS_SORT_DIRECTIONS, {
      error: 'Sort direction must be asc or desc',
    })
    .default('desc'),
  filterUnverified: z
    .boolean({ error: 'Unverified filter must be a boolean' })
    .default(false),
  filterBanned: z
    .boolean({ error: 'Banned filter must be a boolean' })
    .default(false),
  filterNew30d: z
    .boolean({ error: 'New (30d) filter must be a boolean' })
    .default(false),
  emailFilter: z
    .string({ error: 'Email filter must be a string' })
    .trim()
    .max(
      USERS_EMAIL_FILTER_MAX_LENGTH,
      'Email filter must be 200 characters or fewer',
    )
    .optional(),
})

export type ListUsersActionInput = z.input<typeof listUsersActionInputSchema>
