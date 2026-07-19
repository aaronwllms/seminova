import { beforeEach, describe, expect, it } from 'vitest'

import { AuthenticatedBannerSlot } from '@/components/authenticated-banner-slot'
import { BANNER_DISMISSED_AUTHENTICATED_COOKIE } from '@/constants/banner-cookies'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'
import { readBannerDismissCookieValue } from '@/utils/banner-dismiss-cookie'
import { buildBannerDismissKey } from '@/utils/banner-dismiss-hash'
import { render, screen, userEvent } from '@/test/test-utils'

describe('AuthenticatedBannerSlot', () => {
  beforeEach(() => {
    document.cookie = `${BANNER_DISMISSED_AUTHENTICATED_COOKIE}=; path=/; max-age=0`
  })

  it('should render nothing when initialDismissed is true', () => {
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Authenticated notice',
    }

    render(
      <AuthenticatedBannerSlot
        config={config}
        dismissKey={buildBannerDismissKey(config.headline, config.detail)}
        initialDismissed
      />,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('should persist dismissal to the authenticated dismiss cookie', async () => {
    const user = userEvent.setup()
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Authenticated notice',
    }
    const dismissKey = buildBannerDismissKey(config.headline, config.detail)

    render(<AuthenticatedBannerSlot config={config} dismissKey={dismissKey} />)

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))

    expect(
      readBannerDismissCookieValue(BANNER_DISMISSED_AUTHENTICATED_COOKIE),
    ).toBe(dismissKey)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('should stay hidden after remount when initialDismissed is true', () => {
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Stays dismissed',
    }
    const dismissKey = buildBannerDismissKey(config.headline, config.detail)

    const { unmount } = render(
      <AuthenticatedBannerSlot
        config={config}
        dismissKey={dismissKey}
        initialDismissed
      />,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    unmount()
    render(
      <AuthenticatedBannerSlot
        config={config}
        dismissKey={dismissKey}
        initialDismissed
      />,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
