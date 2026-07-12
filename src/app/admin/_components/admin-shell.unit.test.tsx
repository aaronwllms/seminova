import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-inset">{children}</div>
  ),
  SidebarTrigger: () => <button type="button">Toggle sidebar</button>,
}))

vi.mock('./admin-sidebar', () => ({
  AdminSidebar: ({
    email,
    displayName,
    avatarUrl,
  }: {
    email: string
    displayName: string | null
    avatarUrl: string | null
  }) => (
    <nav
      data-testid="admin-sidebar"
      data-email={email}
      data-display-name={displayName ?? ''}
      data-avatar-url={avatarUrl ?? ''}
    />
  ),
}))

vi.mock('@/app/(app)/_components/profile/profile-dialog-provider', () => ({
  ProfileDialogProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('./admin-breadcrumb', () => ({
  AdminBreadcrumb: () => <nav aria-label="Breadcrumb">Admin breadcrumb</nav>,
}))

import { render, screen } from '@/test/test-utils'

import { AdminShell } from './admin-shell'

describe('AdminShell', () => {
  it('should render sidebar, breadcrumb trigger, and children', () => {
    render(
      <AdminShell
        userId="admin-1"
        email="admin@example.com"
        displayName="Admin User"
        bio="Admin bio"
        avatarUrl="https://example.com/avatar.webp"
        profileLoadFailed={false}
      >
        <p>Dashboard content</p>
      </AdminShell>,
    )

    const sidebar = screen.getByTestId('admin-sidebar')
    expect(sidebar).toHaveAttribute('data-email', 'admin@example.com')
    expect(sidebar).toHaveAttribute('data-display-name', 'Admin User')
    expect(sidebar).toHaveAttribute(
      'data-avatar-url',
      'https://example.com/avatar.webp',
    )
    expect(
      screen.getByRole('button', { name: /toggle sidebar/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Admin breadcrumb')).toBeInTheDocument()
    expect(screen.getByText('Dashboard content')).toBeInTheDocument()
  })
})
