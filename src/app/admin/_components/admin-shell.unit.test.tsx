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
  AdminSidebar: ({ email }: { email: string }) => (
    <nav data-testid="admin-sidebar">{email}</nav>
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
      <AdminShell userEmail="admin@example.com">
        <p>Dashboard content</p>
      </AdminShell>,
    )

    expect(screen.getByTestId('admin-sidebar')).toHaveTextContent(
      'admin@example.com',
    )
    expect(
      screen.getByRole('button', { name: /toggle sidebar/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Admin breadcrumb')).toBeInTheDocument()
    expect(screen.getByText('Dashboard content')).toBeInTheDocument()
  })
})
