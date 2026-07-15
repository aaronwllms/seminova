export const DATA_TABLE_PAGE_SIZE_OPTIONS = [10, 15, 25, 50] as const

export const DATA_TABLE_DEFAULT_PAGE_SIZE = 15

export type DataTablePageSize = (typeof DATA_TABLE_PAGE_SIZE_OPTIONS)[number]
