import { LOG_LEVELS, type LogLevel } from '@/types/app-settings'

export const LOG_SEARCH_MAX_LENGTH = 200
export const LOG_TAG_MAX_LENGTH = 100

export interface LogListFilters {
  levels: LogLevel[]
  unreadOnly: boolean
  tag: string | null
  search: string | null
}

export const EMPTY_LOG_LIST_FILTERS: LogListFilters = {
  levels: [],
  unreadOnly: false,
  tag: null,
  search: null,
}

export type FilterableAppLogsQuery = {
  in: (column: string, values: string[]) => FilterableAppLogsQuery
  is: (column: string, value: null) => FilterableAppLogsQuery
  eq: (column: string, value: string) => FilterableAppLogsQuery
  or: (filters: string) => FilterableAppLogsQuery
  ilike: (column: string, pattern: string) => FilterableAppLogsQuery
}

export const escapeIlikePattern = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')

const wrapPostgrestFilterValue = (value: string): string => {
  if (/[,()]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

export const applyLogListFilters = (
  query: FilterableAppLogsQuery,
  filters: LogListFilters,
): FilterableAppLogsQuery => {
  let result: FilterableAppLogsQuery = query

  if (filters.levels.length > 0) {
    result = result.in('level', filters.levels)
  }

  if (filters.unreadOnly) {
    result = result.is('read_at', null)
  }

  if (filters.tag) {
    result = result.eq('tag', filters.tag)
  }

  if (filters.search) {
    const pattern = wrapPostgrestFilterValue(
      `%${escapeIlikePattern(filters.search)}%`,
    )
    result = result.or(
      `message.ilike.${pattern},tag.ilike.${pattern},context_text.ilike.${pattern}`,
    )
  }

  return result
}

const isLogLevel = (value: string): value is LogLevel =>
  (LOG_LEVELS as readonly string[]).includes(value)

export const parseLogListFiltersInput = (
  input: unknown,
):
  | { success: true; filters: LogListFilters }
  | { success: false; message: string } => {
  if (input === undefined || input === null) {
    return { success: true, filters: EMPTY_LOG_LIST_FILTERS }
  }

  if (typeof input !== 'object') {
    return { success: false, message: 'Invalid filters' }
  }

  const raw = input as Record<string, unknown>
  const levelsRaw = raw.levels

  if (levelsRaw !== undefined) {
    if (!Array.isArray(levelsRaw)) {
      return { success: false, message: 'Invalid level filters' }
    }

    if (
      !levelsRaw.every(
        (level) => typeof level === 'string' && isLogLevel(level),
      )
    ) {
      return { success: false, message: 'Invalid level filters' }
    }
  }

  const levels = (levelsRaw ?? []) as LogLevel[]

  if (raw.unreadOnly !== undefined && typeof raw.unreadOnly !== 'boolean') {
    return { success: false, message: 'Invalid unread filter' }
  }

  const unreadOnly = raw.unreadOnly === true

  if (raw.tag !== undefined && raw.tag !== null) {
    if (typeof raw.tag !== 'string' || raw.tag.length > LOG_TAG_MAX_LENGTH) {
      return { success: false, message: 'Invalid tag filter' }
    }
  }

  const tag = typeof raw.tag === 'string' && raw.tag.length > 0 ? raw.tag : null

  if (raw.search !== undefined && raw.search !== null) {
    if (
      typeof raw.search !== 'string' ||
      raw.search.length > LOG_SEARCH_MAX_LENGTH
    ) {
      return { success: false, message: 'Invalid search filter' }
    }
  }

  const search =
    typeof raw.search === 'string' && raw.search.trim().length > 0
      ? raw.search.trim()
      : null

  return {
    success: true,
    filters: {
      levels,
      unreadOnly,
      tag,
      search,
    },
  }
}
