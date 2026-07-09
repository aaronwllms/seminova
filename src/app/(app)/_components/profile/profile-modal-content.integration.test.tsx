import { render, screen } from '@/test/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { ProfileModalContent } from './profile-modal-content'

vi.mock('./profile-settings-form', () => ({
  ProfileSettingsForm: () => <div>Profile form</div>,
}))

vi.mock('./profile-password-section', () => ({
  ProfilePasswordSection: () => <div>Password section</div>,
}))

vi.mock('./profile-theme-segment', () => ({
  ProfileThemeSegment: () => <div>Theme segment</div>,
}))

describe('ProfileModalContent', () => {
  it('should render settings, password, and appearance sections', () => {
    render(
      <ProfileModalContent
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
    expect(screen.getByText('Password section')).toBeInTheDocument()
    expect(screen.getByText('Theme segment')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /^Profile$/i }),
    ).not.toBeInTheDocument()
  })
})
