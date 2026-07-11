import { fireEvent, render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProfileSettingsForm } from './profile-settings-form'

const mockUpdateProfileAction = vi.fn()
const mockRefresh = vi.fn()
const mockUploadUserAvatar = vi.fn()
const mockWithAvatarCacheBust = vi.fn((url: string) => `${url}?v=1`)

vi.mock('@/app/(app)/_lib/profile/actions', () => ({
  updateProfileAction: (...args: unknown[]) => mockUpdateProfileAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock('@/utils/avatar-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/avatar-storage')>()
  return {
    ...actual,
    uploadUserAvatar: (...args: unknown[]) => mockUploadUserAvatar(...args),
    withAvatarCacheBust: (url: string) => mockWithAvatarCacheBust(url),
  }
})

const PUBLIC_URL =
  'https://example.supabase.co/storage/v1/object/public/avatars/user-1/avatar.webp'

const createObjectURL = vi.fn((file: File) => `blob:${file.name}`)
const revokeObjectURL = vi.fn()

const defaultFormProps = {
  userId: 'user-1',
  email: 'test@example.com',
  defaultValues: {
    displayName: 'Alex',
    bio: 'Builder',
    avatarUrl: null as string | null,
  },
}

describe('ProfileSettingsForm', () => {
  beforeEach(() => {
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    })
    mockUpdateProfileAction.mockReset()
    mockRefresh.mockReset()
    mockUploadUserAvatar.mockReset()
    mockWithAvatarCacheBust.mockClear()
    mockUploadUserAvatar.mockResolvedValue({ publicUrl: PUBLIC_URL })
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

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledTimes(1)
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

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledTimes(1)
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

  it('should blur-save display name while avatar persist is in flight', async () => {
    let resolveAvatarPersist: (value: unknown) => void = () => {}
    mockUpdateProfileAction.mockImplementation(
      (payload: { avatarUrl?: string }) => {
        if ('avatarUrl' in payload) {
          return new Promise((resolve) => {
            resolveAvatarPersist = resolve
          })
        }

        return Promise.resolve({
          success: true,
          data: {
            displayName: 'Jordan',
            bio: 'Builder',
            avatarUrl: `${PUBLIC_URL}?v=1`,
          },
        })
      },
    )

    const user = userEvent.setup()
    render(<ProfileSettingsForm {...defaultFormProps} />)

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(mockUploadUserAvatar).toHaveBeenCalled()
      expect(mockUpdateProfileAction).toHaveBeenCalledWith({
        avatarUrl: `${PUBLIC_URL}?v=1`,
      })
    })

    await user.clear(screen.getByLabelText(/display name/i))
    await user.type(screen.getByLabelText(/display name/i), 'Jordan')
    await user.tab()

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledWith({
        displayName: 'Jordan',
      })
    })

    resolveAvatarPersist({
      success: true,
      data: {
        displayName: 'Jordan',
        bio: 'Builder',
        avatarUrl: `${PUBLIC_URL}?v=1`,
      },
    })
  })

  it('should upload avatar while display name persist is in flight', async () => {
    let resolveDisplayNamePersist: (value: unknown) => void = () => {}
    mockUpdateProfileAction.mockImplementation(
      (payload: { displayName?: string }) => {
        if ('displayName' in payload) {
          return new Promise((resolve) => {
            resolveDisplayNamePersist = resolve
          })
        }

        return Promise.resolve({
          success: true,
          data: {
            displayName: 'Jordan',
            bio: 'Builder',
            avatarUrl: `${PUBLIC_URL}?v=1`,
          },
        })
      },
    )

    const user = userEvent.setup()
    render(<ProfileSettingsForm {...defaultFormProps} />)

    await user.clear(screen.getByLabelText(/display name/i))
    await user.type(screen.getByLabelText(/display name/i), 'Jordan')
    fireEvent.blur(screen.getByLabelText(/display name/i))

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledWith({
        displayName: 'Jordan',
      })
    })

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(mockUploadUserAvatar).toHaveBeenCalledWith({
        userId: 'user-1',
        file,
      })
    })

    resolveDisplayNamePersist({
      success: true,
      data: {
        displayName: 'Jordan',
        bio: 'Builder',
        avatarUrl: null,
      },
    })
  })

  it('should show the session email as a read-only field', () => {
    render(<ProfileSettingsForm {...defaultFormProps} />)

    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveValue('test@example.com')
    expect(emailInput).toHaveAttribute('readonly')
    expect(emailInput).not.toBeDisabled()
  })

  it('should remove avatar via server action', async () => {
    const user = userEvent.setup()

    render(
      <ProfileSettingsForm
        {...defaultFormProps}
        defaultValues={{
          displayName: 'Alex',
          bio: 'Builder',
          avatarUrl: `${PUBLIC_URL}?v=1`,
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: /^remove$/i }))

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledWith({ avatarUrl: null })
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})
