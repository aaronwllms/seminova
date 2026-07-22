import { beforeEach, describe, expect, it } from 'vitest'

import { PublicBannerSlot } from '@/components/public-banner-slot'
import { BANNER_DISMISSED_PUBLIC_COOKIE } from '@/constants/banner-cookies'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'
import { readBannerDismissCookieValue } from '@/utils/banner-dismiss-cookie'
import { buildBannerDismissKey } from '@/utils/banner-dismiss-hash'
import { render, screen, userEvent } from '@/test/test-utils'

describe('PublicBannerSlot', () => {
  beforeEach(() => {
    document.cookie = `${BANNER_DISMISSED_PUBLIC_COOKIE}=; path=/; max-age=0`
  })

  it('should render nothing when initialDismissed is true', () => {
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Public notice',
    }

    render(
      <PublicBannerSlot
        config={config}
        dismissKey={buildBannerDismissKey(config.headline, config.detail)}
        initialDismissed
      />,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('should persist dismissal to the public dismiss cookie keyed by headline and detail', async () => {
    const user = userEvent.setup({ delay: null })
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Public notice',
      detail: 'Details here',
    }
    const dismissKey = buildBannerDismissKey(config.headline, config.detail)

    render(<PublicBannerSlot config={config} dismissKey={dismissKey} />)

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))

    expect(readBannerDismissCookieValue(BANNER_DISMISSED_PUBLIC_COOKIE)).toBe(
      dismissKey,
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('should show the banner again when headline or detail changes', async () => {
    const user = userEvent.setup({ delay: null })
    const initialConfig = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Version one',
      detail: 'First detail',
    }
    const initialDismissKey = buildBannerDismissKey(
      initialConfig.headline,
      initialConfig.detail,
    )

    const { rerender } = render(
      <PublicBannerSlot
        config={initialConfig}
        dismissKey={initialDismissKey}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    const nextConfig = {
      ...initialConfig,
      headline: 'Version two',
    }

    rerender(
      <PublicBannerSlot
        key={buildBannerDismissKey(nextConfig.headline, nextConfig.detail)}
        config={nextConfig}
        dismissKey={buildBannerDismissKey(
          nextConfig.headline,
          nextConfig.detail,
        )}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Version two')
  })
})
