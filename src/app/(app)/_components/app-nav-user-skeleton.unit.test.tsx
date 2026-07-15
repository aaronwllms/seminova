import { describe, expect, it } from 'vitest'

import { render, screen } from '@/test/test-utils'

import { AppNavUserSkeleton } from './app-nav-user-skeleton'

describe('AppNavUserSkeleton', () => {
  it('should render a disabled loading account control with a hidden skeleton', () => {
    const { container } = render(<AppNavUserSkeleton />)

    const button = screen.getByRole('button', { name: /loading account menu/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')

    const skeleton = container.querySelector('[data-slot="skeleton"]')
    expect(skeleton).not.toBeNull()
    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
  })
})
