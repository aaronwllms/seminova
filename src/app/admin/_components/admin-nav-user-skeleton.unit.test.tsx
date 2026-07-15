import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarMenuButton: ({
    children,
    ...props
  }: React.ComponentProps<'button'>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
}))

import { render, screen } from '@/test/test-utils'

import { AdminNavUserSkeleton } from './admin-nav-user-skeleton'

describe('AdminNavUserSkeleton', () => {
  it('should render a disabled loading account control with hidden skeletons', () => {
    const { container } = render(<AdminNavUserSkeleton />)

    const button = screen.getByRole('button', { name: /loading account menu/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons).toHaveLength(3)
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
