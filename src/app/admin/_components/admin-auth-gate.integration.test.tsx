import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetDisplayAuthClaims = vi.fn()
const mockRedirect = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

vi.mock('@/supabase/require-auth', () => ({
  getDisplayAuthClaims: (...args: unknown[]) =>
    mockGetDisplayAuthClaims(...args),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: () => undefined,
    }),
  ),
}))

vi.mock('./admin-shell', () => ({
  AdminShell: ({
    children,
    userEmail,
  }: {
    children: React.ReactNode
    userEmail: string
  }) => (
    <div data-testid="admin-shell" data-user-email={userEmail}>
      {children}
    </div>
  ),
}))

import { ADMIN_ROLE } from '@/constants/admin-role'
import { APP_HOME } from '@/constants/app-paths'
import { render, screen } from '@/test/test-utils'

import { AdminAuthGate } from './admin-auth-gate'

describe('AdminAuthGate', () => {
  beforeEach(() => {
    mockGetDisplayAuthClaims.mockReset()
    mockRedirect.mockReset()
  })

  it('should redirect non-admin users to app home', async () => {
    mockGetDisplayAuthClaims.mockResolvedValue({
      sub: 'user-1',
      email: 'user@example.com',
      app_metadata: {},
    })

    await expect(
      AdminAuthGate({ children: <p>Admin content</p> }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(APP_HOME)
  })

  it('should render admin shell for admin users', async () => {
    mockGetDisplayAuthClaims.mockResolvedValue({
      sub: 'admin-1',
      email: 'admin@example.com',
      app_metadata: { role: ADMIN_ROLE },
    })

    render(await AdminAuthGate({ children: <p>Admin content</p> }))

    expect(screen.getByTestId('admin-shell')).toHaveAttribute(
      'data-user-email',
      'admin@example.com',
    )
    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })

  it('should fall back to a generic label when email is missing', async () => {
    mockGetDisplayAuthClaims.mockResolvedValue({
      sub: 'admin-1',
      app_metadata: { role: ADMIN_ROLE },
    })

    render(await AdminAuthGate({ children: <p>Admin content</p> }))

    expect(screen.getByTestId('admin-shell')).toHaveAttribute(
      'data-user-email',
      'Signed-in user',
    )
  })
})
