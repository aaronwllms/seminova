import { fireEvent, render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProfileSettingsForm } from './profile-settings-form'

const mockUpdateProfileAction = vi.fn()
const mockRefresh = vi.fn()

vi.mock('../actions', () => ({
  updateProfileAction: (...args: unknown[]) => mockUpdateProfileAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

describe('ProfileSettingsForm', () => {
  beforeEach(() => {
    mockUpdateProfileAction.mockReset()
    mockRefresh.mockReset()
    mockUpdateProfileAction.mockResolvedValue({
      success: true,
      data: {
        displayName: 'Jordan',
        bio: 'Builder',
        avatarUrl: null,
      },
    })
  })

  it('should blur-save display name with partial action and refresh', async () => {
    const user = userEvent.setup()

    render(
      <ProfileSettingsForm
        userId="user-1"
        email="test@example.com"
        defaultValues={{
          displayName: 'Alex',
          bio: 'Builder',
          avatarUrl: null,
        }}
      />,
    )

    await user.clear(screen.getByLabelText(/display name/i))
    await user.type(screen.getByLabelText(/display name/i), 'Jordan')
    await user.tab()

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledWith({
        displayName: 'Jordan',
      })
      expect(mockRefresh).toHaveBeenCalled()
      expect(screen.getByText(/^Saved$/)).toBeInTheDocument()
    })

    expect(
      screen.queryByRole('button', { name: /save profile/i }),
    ).not.toBeInTheDocument()
  })

  it('should blur-save bio without refreshing', async () => {
    const user = userEvent.setup()

    render(
      <ProfileSettingsForm
        userId="user-1"
        email="test@example.com"
        defaultValues={{
          displayName: 'Alex',
          bio: 'Builder',
          avatarUrl: null,
        }}
      />,
    )

    await user.clear(screen.getByLabelText(/bio/i))
    await user.type(screen.getByLabelText(/bio/i), 'Designer')
    await user.tab()

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledWith({ bio: 'Designer' })
    })

    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('should not persist invalid display name on blur', async () => {
    const user = userEvent.setup()

    render(
      <ProfileSettingsForm
        userId="user-1"
        email="test@example.com"
        defaultValues={{
          displayName: 'Alex',
          bio: '',
          avatarUrl: null,
        }}
      />,
    )

    await user.clear(screen.getByLabelText(/display name/i))
    await user.type(screen.getByLabelText(/display name/i), 'a'.repeat(81))
    await user.tab()

    await waitFor(() => {
      expect(
        screen.getByText(/display name must be 80 characters or fewer/i),
      ).toBeInTheDocument()
    })

    expect(mockUpdateProfileAction).not.toHaveBeenCalled()
  })

  it('should skip duplicate blur-save while display name save is in flight', async () => {
    let resolveUpdate: (value: unknown) => void = () => {}
    mockUpdateProfileAction.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve
        }),
    )

    const user = userEvent.setup()

    render(
      <ProfileSettingsForm
        userId="user-1"
        email="test@example.com"
        defaultValues={{
          displayName: 'Alex',
          bio: '',
          avatarUrl: null,
        }}
      />,
    )

    const input = screen.getByLabelText(/display name/i)
    await user.clear(input)
    await user.type(input, 'Jordan')
    fireEvent.blur(input)
    fireEvent.focus(input)
    fireEvent.blur(input)

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledTimes(1)
    })

    resolveUpdate({
      success: true,
      data: { displayName: 'Jordan', bio: null, avatarUrl: null },
    })
  })

  it('should skip duplicate blur-save while bio save is in flight', async () => {
    let resolveUpdate: (value: unknown) => void = () => {}
    mockUpdateProfileAction.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve
        }),
    )

    const user = userEvent.setup()

    render(
      <ProfileSettingsForm
        userId="user-1"
        email="test@example.com"
        defaultValues={{
          displayName: 'Alex',
          bio: '',
          avatarUrl: null,
        }}
      />,
    )

    const bio = screen.getByLabelText(/bio/i)
    await user.type(bio, 'Designer')
    fireEvent.blur(bio)
    fireEvent.focus(bio)
    fireEvent.blur(bio)

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledTimes(1)
    })

    resolveUpdate({
      success: true,
      data: { displayName: 'Alex', bio: 'Designer', avatarUrl: null },
    })
  })

  it('should surface fault errors from the server action', async () => {
    mockUpdateProfileAction.mockResolvedValue({
      success: false,
      error: {
        message: 'Could not save your profile.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })

    const user = userEvent.setup()

    render(
      <ProfileSettingsForm
        userId="user-1"
        email="test@example.com"
        defaultValues={{
          displayName: 'Alex',
          bio: '',
          avatarUrl: null,
        }}
      />,
    )

    await user.clear(screen.getByLabelText(/display name/i))
    await user.type(screen.getByLabelText(/display name/i), 'Jordan')
    await user.tab()

    expect(
      await screen.findByRole('button', { name: /copy error details/i }),
    ).toBeInTheDocument()
  })
})
