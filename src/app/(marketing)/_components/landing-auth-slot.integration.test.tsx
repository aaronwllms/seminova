import { describe, expect, it, vi } from 'vitest'

const mockHasServerAuthSession = vi.fn()

vi.mock('@/supabase/require-auth', () => ({
  hasServerAuthSession: () => mockHasServerAuthSession(),
}))

vi.mock('@/utils/env', () => ({
  hasPublicSupabaseEnv: true,
}))

import { render, screen } from '@/test/test-utils'

import { LandingAuthSlot } from './landing-auth-slot'

describe('LandingAuthSlot', () => {
  beforeEach(() => {
    mockHasServerAuthSession.mockReset()
  })

  it('should render Open app when the visitor is authenticated', async () => {
    mockHasServerAuthSession.mockResolvedValue(true)

    render(await LandingAuthSlot({}))

    expect(screen.getByRole('link', { name: /open app/i })).toHaveAttribute(
      'href',
      '/home',
    )
  })

  it('should render auth CTAs when the visitor is anonymous', async () => {
    mockHasServerAuthSession.mockResolvedValue(false)

    render(await LandingAuthSlot({}))

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/auth/login',
    )
  })

  it('should render stacked auth CTAs when anonymous on mobile', async () => {
    mockHasServerAuthSession.mockResolvedValue(false)

    render(await LandingAuthSlot({ layout: 'stack' }))

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/auth/login',
    )
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/auth/sign-up',
    )
  })
})
