import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProfileSettingsForm } from './profile-settings-form'

describe('ProfileSettingsForm', () => {
  it('should call onSubmit with form values when saving', async () => {
    const onSubmit = vi.fn().mockResolvedValue(null)
    const user = userEvent.setup()

    render(
      <ProfileSettingsForm
        userId="user-1"
        email="test@example.com"
        defaultValues={{
          displayName: 'Alex',
          bio: 'Builder',
          avatarUrl: '',
        }}
        onSubmit={onSubmit}
      />,
    )

    await user.clear(screen.getByLabelText(/display name/i))
    await user.type(screen.getByLabelText(/display name/i), 'Jordan')
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        displayName: 'Jordan',
        bio: 'Builder',
        avatarUrl: null,
      })
    })
  })

  it('should surface server errors from onSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      message: 'Could not save your profile.',
      code: 'INTERNAL_ERROR',
      kind: 'fault',
    })
    const user = userEvent.setup()

    render(
      <ProfileSettingsForm
        userId="user-1"
        email="test@example.com"
        defaultValues={{
          displayName: 'Alex',
          bio: '',
          avatarUrl: '',
        }}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: /save profile/i }))

    expect(
      await screen.findByRole('button', { name: /copy error details/i }),
    ).toBeInTheDocument()
  })

  it('should surface operational errors inline', async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      message: 'Display name is too long.',
      code: 'VALIDATION_ERROR',
      kind: 'operational',
    })
    const user = userEvent.setup()

    render(
      <ProfileSettingsForm
        userId="user-1"
        email="test@example.com"
        defaultValues={{
          displayName: 'Alex',
          bio: '',
          avatarUrl: '',
        }}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: /save profile/i }))

    expect(
      await screen.findByText(/display name is too long/i),
    ).toBeInTheDocument()
  })
})
