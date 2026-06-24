import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const mockSetTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'system',
    setTheme: mockSetTheme,
  }),
}))

import { ProfileThemeSegment } from './profile-theme-segment'

describe('ProfileThemeSegment', () => {
  beforeEach(() => {
    mockSetTheme.mockReset()
  })

  it('should render theme options and apply selection', async () => {
    const user = userEvent.setup()

    render(<ProfileThemeSegment />)

    expect(
      screen.getByRole('radio', { name: /light theme/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: /dark theme/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: /system theme/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /dark theme/i }))

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })
})
