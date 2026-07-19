import { beforeEach, describe, expect, it, vi } from 'vitest'

import { REQUEST_PATHNAME_LOG_HEADER } from '@/constants/request-log-context'

const mockHeaders = vi.fn()

vi.mock('next/headers', () => ({
  headers: () => mockHeaders(),
}))

import {
  getRequestPathnameForLog,
  withPathnameLogContext,
  withRequestPathnameLogContext,
} from './request-log-context'

describe('withPathnameLogContext', () => {
  it('should return pathname only when context is absent', () => {
    expect(withPathnameLogContext('/home')).toEqual({ pathname: '/home' })
  })

  it('should merge pathname with object context', () => {
    expect(
      withPathnameLogContext('/admin/users', { supabaseCode: 'PGRST116' }),
    ).toEqual({
      pathname: '/admin/users',
      supabaseCode: 'PGRST116',
    })
  })

  it('should merge pathname with Error context', () => {
    const error = new Error('network down')

    expect(withPathnameLogContext('/home', error)).toEqual({
      pathname: '/home',
      name: 'Error',
      message: 'network down',
      stack: error.stack,
    })
  })
})

describe('getRequestPathnameForLog', () => {
  beforeEach(() => {
    mockHeaders.mockReset()
  })

  it('should read the stamped request pathname header', async () => {
    mockHeaders.mockResolvedValue(
      new Headers({ [REQUEST_PATHNAME_LOG_HEADER]: '/home' }),
    )

    await expect(getRequestPathnameForLog()).resolves.toBe('/home')
  })

  it('should return null when the header is absent', async () => {
    mockHeaders.mockResolvedValue(new Headers())

    await expect(getRequestPathnameForLog()).resolves.toBeNull()
  })
})

describe('withRequestPathnameLogContext', () => {
  beforeEach(() => {
    mockHeaders.mockReset()
  })

  it('should merge pathname from headers with error context', async () => {
    mockHeaders.mockResolvedValue(
      new Headers({ [REQUEST_PATHNAME_LOG_HEADER]: '/admin' }),
    )

    const error = new Error('missing token')

    await expect(withRequestPathnameLogContext(error)).resolves.toEqual({
      pathname: '/admin',
      name: 'Error',
      message: 'missing token',
      stack: error.stack,
    })
  })
})
