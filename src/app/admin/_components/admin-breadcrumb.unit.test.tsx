import { describe, expect, it, vi } from 'vitest'

const mockPathname = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

import { ADMIN_HOME } from '@/constants/admin-paths'
import { render, screen } from '@/test/test-utils'

import { AdminBreadcrumb } from './admin-breadcrumb'

describe('AdminBreadcrumb', () => {
  it('should show only Admin on the dashboard route', () => {
    mockPathname.mockReturnValue(ADMIN_HOME)

    render(<AdminBreadcrumb />)

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /home/i }),
    ).not.toBeInTheDocument()
  })

  it('should show Home and Users on the users route', () => {
    mockPathname.mockReturnValue('/admin/users')

    render(<AdminBreadcrumb />)

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
      'href',
      ADMIN_HOME,
    )
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('should show Home and Settings on the settings route', () => {
    mockPathname.mockReturnValue('/admin/settings')

    render(<AdminBreadcrumb />)

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
      'href',
      ADMIN_HOME,
    )
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
