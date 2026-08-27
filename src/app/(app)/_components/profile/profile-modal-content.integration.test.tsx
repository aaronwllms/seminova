import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '@/test/test-utils'

import { ProfileModalContent } from './profile-modal-content'

const mockUpdateProfileAction = vi.fn()
const mockSetFirstPasswordAction = vi.fn()
const mockRefresh = vi.fn()
const mockUpdateUser = vi.fn()
const mockSetTheme = vi.fn()

vi.mock('@/app/(app)/_lib/profile/actions', () => ({
  updateProfileAction: (...args: unknown[]) => mockUpdateProfileAction(...args),
  setFirstPasswordAction: (...args: unknown[]) =>
    mockSetFirstPasswordAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  }),
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: vi.fn(),
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'system',
    setTheme: mockSetTheme,
  }),
}))

vi.mock('@/utils/avatar-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/avatar-storage')>()
  return {
    ...actual,
    uploadUserAvatar: vi.fn(),
    withAvatarCacheBust: (url: string) => `${url}?v=1`,
  }
})

const defaultProps = {
  userId: 'user-1',
  email: 'test@example.com',
  hasPassword: true,
  defaultValues: {
    displayName: 'Alex',
    bio: 'Builder',
    avatarUrl: null,
  },
}

describe('ProfileModalContent', () => {
  beforeEach(() => {
    mockUpdateProfileAction.mockReset()
    mockSetFirstPasswordAction.mockReset()
    mockRefresh.mockReset()
    mockUpdateUser.mockReset()
    mockSetTheme.mockReset()
    mockUpdateProfileAction.mockResolvedValue({
      success: true,
      data: {
        displayName: 'Alex',
        bio: 'Builder',
        avatarUrl: null,
      },
    })
  })

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
    const user = userEvent.setup({ delay: null })

    render(<ProfileModalContent {...defaultProps} />)

    expect(screen.queryByLabelText(/current password/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
  })

  it('should show Set Password and no current field when hasPassword is false', async () => {
    const user = userEvent.setup({ delay: null })

    render(<ProfileModalContent {...defaultProps} hasPassword={false} />)

    expect(
      screen.getByRole('button', { name: /set password/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /set password/i }))

    expect(screen.queryByLabelText(/current password/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it('should collapse the accordion after a successful password change', async () => {
    mockUpdateUser.mockResolvedValue({ error: null })
    const user = userEvent.setup({ delay: null })

    render(<ProfileModalContent {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /change password/i }))
    await user.type(screen.getByLabelText(/current password/i), 'old-password')
    await user.type(screen.getByLabelText(/^new password$/i), 'password123')
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      'password123',
    )
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(
        screen.queryByLabelText(/current password/i),
      ).not.toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: /change password/i }),
    ).toBeInTheDocument()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('should collapse the accordion and switch to Change Password after a successful first set', async () => {
    mockSetFirstPasswordAction.mockResolvedValue({ success: true })
    const user = userEvent.setup({ delay: null })

    render(<ProfileModalContent {...defaultProps} hasPassword={false} />)

    await user.click(screen.getByRole('button', { name: /set password/i }))
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/^confirm password$/i), 'password123')
    await user.click(
      screen.getByRole('button', {
        name: (accessibleName, element) =>
          /set password/i.test(accessibleName) &&
          element.getAttribute('type') === 'submit',
      }),
    )

    await waitFor(() => {
      expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: /change password/i }),
    ).toBeInTheDocument()
    expect(mockRefresh).toHaveBeenCalled()
  })
})
