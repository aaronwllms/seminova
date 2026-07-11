import { describe, expect, it } from 'vitest'

import { render, screen } from '@/test/test-utils'

import { UserAvatar } from './user-avatar'

describe('UserAvatar', () => {
  it('should render profile initials from display name', () => {
    render(
      <UserAvatar
        displayName="Alice Smith"
        email="alice@example.com"
        avatarUrl={null}
      />,
    )

    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('should fall back to email initials when display name is missing', () => {
    render(
      <UserAvatar
        displayName={null}
        email="admin@example.com"
        avatarUrl={null}
      />,
    )

    expect(screen.getByText('AD')).toBeInTheDocument()
  })

  it('should omit avatar image when avatarUrl is missing', () => {
    const { container } = render(
      <UserAvatar
        displayName="Alice Smith"
        email="alice@example.com"
        avatarUrl={null}
      />,
    )

    expect(container.querySelector('[data-slot="avatar-image"]')).toBeNull()
    expect(screen.getByText('AS')).toBeInTheDocument()
  })
})
