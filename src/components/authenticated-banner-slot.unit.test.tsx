import { beforeEach, describe, expect, it } from 'vitest'

import { AuthenticatedBannerSlot } from '@/components/authenticated-banner-slot'
import {
  BANNER_DISMISSED_AUTHENTICATED_COOKIE,
  BANNER_DISMISSED_PUBLIC_COOKIE,
} from '@/constants/banner-cookies'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'
import { readBannerDismissCookieValue } from '@/utils/banner-dismiss-cookie'
import { buildBannerDismissKey } from '@/utils/banner-dismiss-hash'
import { render, screen, userEvent } from '@/test/test-utils'

describe('AuthenticatedBannerSlot', () => {
  beforeEach(() => {
    document.cookie = `${BANNER_DISMISSED_AUTHENTICATED_COOKIE}=; path=/; max-age=0`
  })

  it('should persist dismissal to the authenticated dismiss cookie keyed by headline and detail', async () => {
    const user = userEvent.setup({ delay: null })
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Authenticated notice',
      detail: 'Details here',
    }
    const dismissKey = buildBannerDismissKey(config.headline, config.detail)

    render(<AuthenticatedBannerSlot config={config} dismissKey={dismissKey} />)

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))

    expect(
      readBannerDismissCookieValue(BANNER_DISMISSED_AUTHENTICATED_COOKIE),
    ).toBe(dismissKey)
    expect(readBannerDismissCookieValue(BANNER_DISMISSED_PUBLIC_COOKIE)).toBe(
      undefined,
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
      <AuthenticatedBannerSlot
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
      <AuthenticatedBannerSlot
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

  it('should render a persistent banner without a dismiss button', () => {
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      persistence: 'persistent' as const,
      headline: 'Must read',
    }

    render(
      <AuthenticatedBannerSlot
        config={config}
        dismissKey={buildBannerDismissKey(config.headline, config.detail)}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Must read')
    expect(document.querySelector('[aria-label="Dismiss banner"]')).toBeNull()
  })
})
