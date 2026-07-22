import type { LogLevel } from '@/types/app-settings'

import { isLogLevel } from './app-log-row'

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

export interface LogListFilterChip {
  id: string
  label: string
}

type LogListFilterMethods = {
  in(column: string, values: string[]): LogListFilterMethods
  is(column: string, value: null): LogListFilterMethods
  eq(column: string, value: string): LogListFilterMethods
  or(filters: string): LogListFilterMethods
}

const truncateFilterDisplay = (value: string): string =>
  value.length > 20 ? `${value.slice(0, 17)}…` : value

export const hasActiveLogListFilters = (filters: LogListFilters): boolean =>
  filters.levels.length > 0 ||
  filters.unreadOnly ||
  filters.tag !== null ||
  filters.search !== null

export const buildLogListFilterChips = (
  filters: LogListFilters,
): LogListFilterChip[] => {
  const chips: LogListFilterChip[] = []

  for (const level of filters.levels) {
    chips.push({
      id: `level:${level}`,
      label: level.charAt(0).toUpperCase() + level.slice(1),
    })
  }

  if (filters.unreadOnly) {
    chips.push({ id: 'unread', label: 'Unread' })
  }

  if (filters.tag) {
    chips.push({
      id: 'tag',
      label: `Tag: ${truncateFilterDisplay(filters.tag)}`,
    })
  }

  if (filters.search) {
    chips.push({
      id: 'search',
      label: `Search: ${truncateFilterDisplay(filters.search)}`,
    })
  }

  return chips
}

export const buildMarkAllLogsReadTooltip = (
  filteredUnreadCount: number,
  filters: LogListFilters,
): string => {
  if (filteredUnreadCount === 0) {
    return 'No unread logs in the current view.'
  }

  return hasActiveLogListFilters(filters)
    ? 'Mark unread logs in the current filter view as read'
    : 'Mark all unread logs as read'
}

export const escapeIlikePattern = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')

const wrapPostgrestFilterValue = (value: string): string => {
  if (/[,()]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

const applyLogListFiltersCore = (
  query: LogListFilterMethods,
  filters: LogListFilters,
): LogListFilterMethods => {
  let result: LogListFilterMethods = query

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

export const applyLogListFilters = <T>(query: T, filters: LogListFilters): T =>
  applyLogListFiltersCore(query as LogListFilterMethods, filters) as T

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
