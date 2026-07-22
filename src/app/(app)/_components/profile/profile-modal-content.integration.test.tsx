import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test/test-utils'

import { ProfileModalContent } from './profile-modal-content'

const mockUpdateProfileAction = vi.fn()
const mockRefresh = vi.fn()
const mockUpdateUser = vi.fn()
const mockSetTheme = vi.fn()

vi.mock('@/app/(app)/_lib/profile/actions', () => ({
  updateProfileAction: (...args: unknown[]) => mockUpdateProfileAction(...args),
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
  defaultValues: {
    displayName: 'Alex',
    bio: 'Builder',
    avatarUrl: null,
  },
}

describe('ProfileModalContent', () => {
  beforeEach(() => {
    mockUpdateProfileAction.mockReset()
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
})
