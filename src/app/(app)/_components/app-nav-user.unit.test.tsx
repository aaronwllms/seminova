import userEvent from '@testing-library/user-event'
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

import { PROFILE_PATH } from '@/constants/app-paths'
import { render, screen, waitFor } from '@/test/test-utils'

import { AppNavUser } from './app-nav-user'

describe('AppNavUser', () => {
  beforeEach(() => {
    mockSignOut.mockReset()
    mockPush.mockReset()
  })

  it('should open menu with profile link and sign out', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    const user = userEvent.setup()

    render(
      <AppNavUser
        displayName="Alice Smith"
        avatarUrl={null}
        email="alice@example.com"
      />,
    )

    await user.click(screen.getByRole('button', { name: /account menu/i }))

    expect(screen.getByRole('menuitem', { name: /profile/i })).toHaveAttribute(
      'href',
      PROFILE_PATH,
    )

    await user.click(screen.getByRole('menuitem', { name: /sign out/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })
})
