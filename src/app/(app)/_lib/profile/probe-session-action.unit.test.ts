import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.fn()
const mockAppLogWarn = vi.fn()

vi.mock('@/utils/app-logger', () => ({
  appLog: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: (...args: unknown[]) => mockAppLogWarn(...args),
    error: vi.fn(),
  },
}))

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

import { probeSessionAction } from './probe-session-action'

describe('probeSessionAction', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockAppLogWarn.mockReset()
  })

  it('should return success when a user is present', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    await expect(probeSessionAction()).resolves.toEqual({ success: true })
    expect(mockAppLogWarn).not.toHaveBeenCalled()
  })

  it('should return failure when getUser reports an error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { code: 'session_not_found', message: 'invalid session' },
    })

    await expect(probeSessionAction()).resolves.toEqual({ success: false })
    expect(mockAppLogWarn).toHaveBeenCalledWith(
      'probe-session',
      'Session probe failed',
      { supabaseCode: 'session_not_found' },
    )
  })

  it('should return failure when user is null', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    await expect(probeSessionAction()).resolves.toEqual({ success: false })
    expect(mockAppLogWarn).not.toHaveBeenCalled()
  })
})
