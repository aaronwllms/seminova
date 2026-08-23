import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  BANNER_DISMISSED_AUTHENTICATED_COOKIE,
  BANNER_DISMISSED_PUBLIC_COOKIE,
} from '@/constants/banner-cookies'
import {
  readBannerDismissCookieValue,
  writeBannerDismissCookie,
} from '@/utils/banner-dismiss-cookie'

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
    document.cookie = `${BANNER_DISMISSED_AUTHENTICATED_COOKIE}=; path=/; max-age=0`
    document.cookie = `${BANNER_DISMISSED_PUBLIC_COOKIE}=; path=/; max-age=0`
  })

  it('should sign out and redirect to login', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useSignOut())

    await result.current()

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' })
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('should clear the authenticated dismiss cookie and leave the public cookie', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    writeBannerDismissCookie(BANNER_DISMISSED_AUTHENTICATED_COOKIE, 'auth-key')
    writeBannerDismissCookie(BANNER_DISMISSED_PUBLIC_COOKIE, 'public-key')

    const { result } = renderHook(() => useSignOut())

    await result.current()

    await waitFor(() => {
      expect(
        readBannerDismissCookieValue(BANNER_DISMISSED_AUTHENTICATED_COOKIE),
      ).toBeUndefined()
      expect(readBannerDismissCookieValue(BANNER_DISMISSED_PUBLIC_COOKIE)).toBe(
        'public-key',
      )
    })
  })
})
