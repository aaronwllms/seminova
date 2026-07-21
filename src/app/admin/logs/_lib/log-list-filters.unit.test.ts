import { describe, expect, it, vi } from 'vitest'

import {
  applyLogListFilters,
  buildLogListFilterChips,
  buildMarkAllLogsReadTooltip,
  escapeIlikePattern,
  hasActiveLogListFilters,
  parseLogListFiltersInput,
} from './log-list-filters'

const createFilterableQuery = () => {
  const chain = {
    in: vi.fn(),
    is: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
    ilike: vi.fn(),
  }

  chain.in.mockReturnValue(chain)
  chain.is.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.or.mockReturnValue(chain)
  chain.ilike.mockReturnValue(chain)

  return chain
}

describe('log-list-filters', () => {
  it('should escape ilike metacharacters', () => {
    expect(escapeIlikePattern('100%_done\\')).toBe('100\\%\\_done\\\\')
  })

  it('should apply level, unread, tag, and search filters', () => {
    const query = createFilterableQuery()

    applyLogListFilters(query, {
      levels: ['info', 'warn'],
      unreadOnly: true,
      tag: 'auth-session',
      search: 'token',
    })

    expect(query.in).toHaveBeenCalledWith('level', ['info', 'warn'])
    expect(query.is).toHaveBeenCalledWith('read_at', null)
    expect(query.eq).toHaveBeenCalledWith('tag', 'auth-session')
    expect(query.or).toHaveBeenCalledWith(
      'message.ilike.%token%,tag.ilike.%token%,context_text.ilike.%token%',
    )
  })

  it('should reject invalid filter input', () => {
    expect(parseLogListFiltersInput({ levels: ['bad'] })).toEqual({
      success: false,
      message: 'Invalid level filters',
    })
  })

  it('should normalize empty search and tag values', () => {
    expect(parseLogListFiltersInput({ search: '   ', tag: '' })).toEqual({
      success: true,
      filters: {
        levels: [],
        unreadOnly: false,
        tag: null,
        search: null,
      },
    })
  })

  it('should detect active log list filters', () => {
    expect(
      hasActiveLogListFilters({
        levels: [],
        unreadOnly: false,
        tag: null,
        search: null,
      }),
    ).toBe(false)

    expect(
      hasActiveLogListFilters({
        levels: ['error'],
        unreadOnly: false,
        tag: null,
        search: null,
      }),
    ).toBe(true)

    expect(
      hasActiveLogListFilters({
        levels: [],
        unreadOnly: true,
        tag: 'auth-session',
        search: 'token',
      }),
    ).toBe(true)
  })

  it('should build one chip per active filter with stable ids', () => {
    expect(
      buildLogListFilterChips({
        levels: ['debug', 'error'],
        unreadOnly: true,
        tag: 'auth-session',
        search: 'token',
      }),
    ).toEqual([
      { id: 'level:debug', label: 'Debug' },
      { id: 'level:error', label: 'Error' },
      { id: 'unread', label: 'Unread' },
      { id: 'tag', label: 'Tag: auth-session' },
      { id: 'search', label: 'Search: token' },
    ])
  })

  it('should truncate long tag and search chip labels', () => {
    const longValue = 'a'.repeat(25)

    expect(
      buildLogListFilterChips({
        levels: [],
        unreadOnly: false,
        tag: longValue,
        search: longValue,
      }),
    ).toEqual([
      { id: 'tag', label: `Tag: ${'a'.repeat(17)}…` },
      { id: 'search', label: `Search: ${'a'.repeat(17)}…` },
    ])
  })

  it('should build mark-all-read tooltip copy from unread count and filters', () => {
    expect(
      buildMarkAllLogsReadTooltip(0, {
        levels: [],
        unreadOnly: false,
        tag: null,
        search: null,
      }),
    ).toBe('No unread logs in the current view.')

    expect(
      buildMarkAllLogsReadTooltip(2, {
        levels: ['error'],
        unreadOnly: false,
        tag: null,
        search: null,
      }),
    ).toBe('Mark unread logs in the current filter view as read')

    expect(
      buildMarkAllLogsReadTooltip(2, {
        levels: [],
        unreadOnly: false,
        tag: null,
        search: null,
      }),
    ).toBe('Mark all unread logs as read')
  })
})
