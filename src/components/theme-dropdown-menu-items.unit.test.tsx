import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSetTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'system',
    setTheme: mockSetTheme,
  }),
}))

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { render, screen } from '@/test/test-utils'

import { ThemeDropdownMenuItems } from './theme-dropdown-menu-items'

describe('ThemeDropdownMenuItems', () => {
  beforeEach(() => {
    mockSetTheme.mockReset()
  })

  it('should render theme options with a checkmark on the active theme', async () => {
    const user = userEvent.setup({ delay: null })

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button type="button">Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <ThemeDropdownMenuItems />
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    expect(screen.getByRole('menuitem', { name: /light/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /system/i }),
    ).toBeInTheDocument()

    const systemItem = screen.getByRole('menuitem', { name: /system/i })
    expect(systemItem.querySelector('svg.lucide-check')).toBeInTheDocument()
    expect(
      screen
        .getByRole('menuitem', { name: /light/i })
        .querySelector('svg.lucide-check'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: /dark/i }))

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /light/i })).toBeInTheDocument()
  })
})
