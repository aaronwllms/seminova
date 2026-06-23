import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSignOut = vi.fn()
const mockPush = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

import { useSignOut } from './use-sign-out'

describe('useSignOut', () => {
  beforeEach(() => {
    mockSignOut.mockReset()
    mockPush.mockReset()
  })

  it('should sign out and redirect to login', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useSignOut())

    await result.current()

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })
})
