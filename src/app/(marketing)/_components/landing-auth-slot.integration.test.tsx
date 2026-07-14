import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockHasServerAuthSession = vi.fn()

vi.mock('@/supabase/require-auth', () => ({
  hasServerAuthSession: () => mockHasServerAuthSession(),
}))

vi.mock('@/utils/env', () => ({
  hasPublicSupabaseEnv: true,
}))

vi.mock('@/app/(app)/_components/app-header-account-nav', () => ({
  AppHeaderAccountNav: ({ showOpenApp }: { showOpenApp?: boolean }) => (
    <button
      type="button"
      aria-label="Account menu"
      data-show-open-app={String(showOpenApp ?? false)}
    />
  ),
}))

import { render, screen } from '@/test/test-utils'

import { LandingAuthSlot } from './landing-auth-slot'

describe('LandingAuthSlot', () => {
  beforeEach(() => {
    mockHasServerAuthSession.mockReset()
  })

  it('should render account menu when the visitor is authenticated', async () => {
    mockHasServerAuthSession.mockResolvedValue(true)

    render(await LandingAuthSlot({}))

    const accountMenu = screen.getByRole('button', { name: /account menu/i })
    expect(accountMenu).toBeInTheDocument()
    expect(accountMenu).toHaveAttribute('data-show-open-app', 'true')
    expect(
      screen.queryByRole('link', { name: /open app/i }),
    ).not.toBeInTheDocument()
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
