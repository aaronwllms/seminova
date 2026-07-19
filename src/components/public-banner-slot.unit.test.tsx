import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_BANNER_SETTING } from '@/types/banner'
import { buildBannerDismissStorageKey } from '@/utils/banner-dismiss-hash'
import { render, screen, userEvent } from '@/test/test-utils'

import { PublicBannerSlot } from './public-banner-slot'

describe('PublicBannerSlot', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('should persist dismissal to localStorage keyed by headline and detail', async () => {
    const user = userEvent.setup()
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Public notice',
      detail: 'Details here',
    }
    const dismissKey = buildBannerDismissStorageKey(
      config.headline,
      config.detail,
    )

    render(<PublicBannerSlot config={config} />)

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))

    expect(window.localStorage.getItem(dismissKey)).toBe('1')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('should show the banner again when headline or detail changes', async () => {
    const user = userEvent.setup()
    const initialConfig = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Version one',
      detail: 'First detail',
    }

    const { rerender } = render(<PublicBannerSlot config={initialConfig} />)

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(
      <PublicBannerSlot
        config={{
          ...initialConfig,
          headline: 'Version two',
        }}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Version two')
  })
})
