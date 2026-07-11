import { describe, expect, it, vi } from 'vitest'

const mockPathname = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <aside>{children}</aside>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarMenuButton: ({
    children,
    asChild,
    ...props
  }: React.ComponentProps<'button'> & { asChild?: boolean }) =>
    asChild ? (
      <>{children}</>
    ) : (
      <button type="button" {...props}>
        {children}
      </button>
    ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarRail: () => null,
}))

vi.mock('@/components/seminova-logo', () => ({
  SeminovaLogo: () => <span>Seminova</span>,
}))

vi.mock('./admin-nav-user', () => ({
  AdminNavUser: ({
    email,
    displayName,
    avatarUrl,
  }: {
    email: string
    displayName: string | null
    avatarUrl: string | null
  }) => (
    <div
      data-testid="admin-nav-user"
      data-email={email}
      data-display-name={displayName ?? ''}
      data-avatar-url={avatarUrl ?? ''}
    />
  ),
}))

import { ADMIN_USERS } from '@/constants/admin-paths'
import { render, screen } from '@/test/test-utils'

import { AdminSidebar } from './admin-sidebar'

describe('AdminSidebar', () => {
  it('should render logo, Users nav link, and footer user menu', () => {
    mockPathname.mockReturnValue(ADMIN_USERS)

    render(
      <AdminSidebar
        email="admin@example.com"
        displayName="Admin User"
        avatarUrl="https://example.com/avatar.webp"
      />,
    )

    const navUser = screen.getByTestId('admin-nav-user')
    expect(navUser).toHaveAttribute('data-email', 'admin@example.com')
    expect(navUser).toHaveAttribute('data-display-name', 'Admin User')
    expect(navUser).toHaveAttribute(
      'data-avatar-url',
      'https://example.com/avatar.webp',
    )
    expect(screen.getByText('Seminova')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /users/i })).toHaveAttribute(
      'href',
      ADMIN_USERS,
    )
  })
})
