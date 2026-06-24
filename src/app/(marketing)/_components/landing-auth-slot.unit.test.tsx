import { describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

vi.mock('@/utils/env', () => ({
  hasEnvVars: true,
}))

import { render, screen } from '@/test/test-utils'

import { LandingAuthSlot } from './landing-auth-slot'

describe('LandingAuthSlot', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
  })

  it('should render Open app when the visitor is authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    })

    render(await LandingAuthSlot({}))

    expect(screen.getByRole('link', { name: /open app/i })).toHaveAttribute(
      'href',
      '/profile',
    )
  })

  it('should render auth CTAs when the visitor is anonymous', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    })

    render(await LandingAuthSlot({}))

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/auth/login',
    )
  })

  it('should render stacked Open app CTA when authenticated on mobile', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    })

    render(await LandingAuthSlot({ layout: 'stack' }))

    expect(screen.getByRole('link', { name: /open app/i })).toHaveClass(
      'w-full',
    )
  })
})
