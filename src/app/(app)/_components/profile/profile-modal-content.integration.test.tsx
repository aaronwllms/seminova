import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test/test-utils'

import { ProfileModalContent } from './profile-modal-content'

vi.mock('./profile-settings-form', () => ({
  ProfileSettingsForm: () => <div data-testid="profile-settings-form" />,
}))

vi.mock('./profile-password-section', () => ({
  ProfilePasswordSection: () => (
    <div data-testid="profile-password-section">
      <label htmlFor="current-password">Current password</label>
      <input id="current-password" />
    </div>
  ),
}))

vi.mock('./profile-theme-segment', () => ({
  ProfileThemeSegment: () => <div data-testid="profile-theme-segment" />,
}))

const defaultProps = {
  userId: 'user-1',
  email: 'test@example.com',
  defaultValues: {
    displayName: 'Alex',
    bio: 'Builder',
    avatarUrl: null,
  },
}

describe('ProfileModalContent', () => {
  it('should render Appearance before Password', () => {
    render(<ProfileModalContent {...defaultProps} />)

    const appearanceHeading = screen.getByRole('heading', {
      name: /appearance/i,
    })
    const passwordTrigger = screen.getByRole('button', {
      name: /change password/i,
    })

    expect(
      appearanceHeading.compareDocumentPosition(passwordTrigger) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('should keep password collapsed by default and reveal fields on expand', async () => {
    const user = userEvent.setup()

    render(<ProfileModalContent {...defaultProps} />)

    expect(screen.queryByLabelText(/current password/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
  })
})
