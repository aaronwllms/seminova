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
  AdminNavUser: ({ email }: { email: string }) => (
    <div data-testid="admin-nav-user">{email}</div>
  ),
}))

import { ADMIN_USERS } from '@/constants/admin-paths'
import { render, screen } from '@/test/test-utils'

import { AdminSidebar } from './admin-sidebar'

describe('AdminSidebar', () => {
  it('should render logo, Users nav link, and footer user menu', () => {
    mockPathname.mockReturnValue(ADMIN_USERS)

    render(<AdminSidebar email="admin@example.com" />)

    expect(screen.getByText('Seminova')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /users/i })).toHaveAttribute(
      'href',
      ADMIN_USERS,
    )
    expect(screen.getByTestId('admin-nav-user')).toHaveTextContent(
      'admin@example.com',
    )
  })
})
