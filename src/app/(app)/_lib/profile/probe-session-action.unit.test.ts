import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.fn()

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
  })

  it('should return success when a user is present', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    await expect(probeSessionAction()).resolves.toEqual({ success: true })
  })

  it('should return failure when getUser reports an error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error('invalid session'),
    })

    await expect(probeSessionAction()).resolves.toEqual({ success: false })
  })

  it('should return failure when user is null', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    await expect(probeSessionAction()).resolves.toEqual({ success: false })
  })
})
