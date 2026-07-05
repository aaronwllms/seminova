import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockRequireAuthClaims = vi.fn()
const mockCreateClient = vi.fn()
const mockRedirect = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

vi.mock('@/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}))

vi.mock('@/supabase/require-auth', () => ({
  requireAuthClaims: (...args: unknown[]) => mockRequireAuthClaims(...args),
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
import { PROFILE_PATH } from '@/constants/app-paths'
import { render, screen } from '@/test/test-utils'

import { AdminAuthGate } from './admin-auth-gate'

describe('AdminAuthGate', () => {
  beforeEach(() => {
    mockRequireAuthClaims.mockReset()
    mockCreateClient.mockReset()
    mockRedirect.mockReset()
    mockCreateClient.mockResolvedValue({})
  })

  it('should propagate redirect when unauthenticated', async () => {
    mockRequireAuthClaims.mockRejectedValue(new Error('NEXT_REDIRECT'))

    await expect(
      AdminAuthGate({ children: <p>Admin content</p> }),
    ).rejects.toThrow('NEXT_REDIRECT')
  })

  it('should redirect non-admin users to profile', async () => {
    mockRequireAuthClaims.mockResolvedValue({
      sub: 'user-1',
      email: 'user@example.com',
      app_metadata: {},
    })

    await expect(
      AdminAuthGate({ children: <p>Admin content</p> }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(PROFILE_PATH)
  })

  it('should render admin shell for admin users', async () => {
    mockRequireAuthClaims.mockResolvedValue({
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
    mockRequireAuthClaims.mockResolvedValue({
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
