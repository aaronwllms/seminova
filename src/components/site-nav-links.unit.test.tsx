import { describe, expect, it, vi } from 'vitest'

const mockPathname = vi.fn(() => '/')

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

import { isSiteNavLinkActive, SiteNavLinks } from '@/components/site-nav-links'
import { render, screen } from '@/test/test-utils'

describe('isSiteNavLinkActive', () => {
  it('should match pathname for route links and exclude hash anchors', () => {
    expect(isSiteNavLinkActive('/', '/')).toBe(true)
    expect(isSiteNavLinkActive('/#features', '/')).toBe(false)
    expect(isSiteNavLinkActive('/reference', '/reference')).toBe(true)
    expect(isSiteNavLinkActive('/reference', '/')).toBe(false)
  })

  it('should never treat external links as active', () => {
    expect(isSiteNavLinkActive('https://github.com/example', '/', true)).toBe(
      false,
    )
  })
})

describe('SiteNavLinks', () => {
  it('should mark Home as the current page on /', () => {
    mockPathname.mockReturnValue('/')
    render(<SiteNavLinks />)

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Features' })).not.toHaveAttribute(
      'aria-current',
    )
    expect(screen.getByRole('link', { name: 'Reference' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('should mark Reference as the current page on /reference', () => {
    mockPathname.mockReturnValue('/reference')
    render(<SiteNavLinks />)

    expect(screen.getByRole('link', { name: 'Reference' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('should never set aria-current on the external GitHub link', () => {
    mockPathname.mockReturnValue('/')
    render(<SiteNavLinks />)

    expect(screen.getByRole('link', { name: 'GitHub' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
