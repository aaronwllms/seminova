import { describe, expect, it } from 'vitest'

import { AuthenticatedBannerSlot } from '@/components/authenticated-banner-slot'
import { BANNER_DISMISSED_PUBLIC_COOKIE } from '@/constants/banner-cookies'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'
import { readBannerDismissCookieValue } from '@/utils/banner-dismiss-cookie'
import { render, screen, userEvent } from '@/test/test-utils'

describe('AuthenticatedBannerSlot', () => {
  it('should render nothing when initialDismissed is true', () => {
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Authenticated notice',
    }

    render(<AuthenticatedBannerSlot config={config} initialDismissed />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('should hide on dismiss without writing a dismiss cookie', async () => {
    const user = userEvent.setup()
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Authenticated notice',
    }

    render(<AuthenticatedBannerSlot config={config} />)

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))

    expect(readBannerDismissCookieValue(BANNER_DISMISSED_PUBLIC_COOKIE)).toBe(
      undefined,
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('should reappear after remount following an in-session dismiss', async () => {
    const user = userEvent.setup()
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Returns on reload',
    }

    const { unmount } = render(<AuthenticatedBannerSlot config={config} />)

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    unmount()
    render(<AuthenticatedBannerSlot config={config} />)

    expect(screen.getByRole('status')).toHaveTextContent('Returns on reload')
  })
})
