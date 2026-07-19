import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_BANNER_SETTING } from '@/types/banner'
import { render, screen, userEvent } from '@/test/test-utils'

import { AuthenticatedBannerSlot } from './authenticated-banner-slot'

describe('AuthenticatedBannerSlot', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('should dismiss in memory without writing to localStorage', async () => {
    const user = userEvent.setup()
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Authenticated notice',
    }

    render(<AuthenticatedBannerSlot config={config} />)

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))

    expect(window.localStorage.length).toBe(0)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('should show the banner again after remount', async () => {
    const user = userEvent.setup()
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Comes back on reload',
    }

    const { unmount } = render(<AuthenticatedBannerSlot config={config} />)

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    unmount()
    render(<AuthenticatedBannerSlot config={config} />)

    expect(screen.getByRole('status')).toHaveTextContent('Comes back on reload')
  })
})
