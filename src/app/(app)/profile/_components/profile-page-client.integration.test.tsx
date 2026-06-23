import { render, screen } from '@/test/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { ProfilePageClient } from './profile-page-client'

vi.mock('./profile-settings-form', () => ({
  ProfileSettingsForm: () => <div>Profile form</div>,
}))

vi.mock('./profile-password-dialog', () => ({
  ProfilePasswordDialog: () => <button type="button">Change password</button>,
}))

vi.mock('./profile-theme-segment', () => ({
  ProfileThemeSegment: () => <div>Theme segment</div>,
}))

describe('ProfilePageClient', () => {
  it('should render lighter sections without duplicate Profile card title', () => {
    render(
      <ProfilePageClient
        userId="user-1"
        email="test@example.com"
        defaultValues={{
          displayName: 'Alex',
          bio: 'Builder',
          avatarUrl: null,
        }}
      />,
    )

    expect(screen.getByText('Profile form')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /change password/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Theme segment')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /^Profile$/i }),
    ).not.toBeInTheDocument()
  })
})
