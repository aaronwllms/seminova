import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_BANNER_SETTING } from '@/types/banner'
import { render, screen, userEvent } from '@/test/test-utils'

import { AppBanner } from './app-banner'

describe('AppBanner', () => {
  it('should render when the banner is live', () => {
    render(
      <AppBanner
        config={{
          ...DEFAULT_BANNER_SETTING,
          mode: 'on',
          headline: 'System update complete',
        }}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'System update complete',
    )
  })

  it('should return null when the banner is off', () => {
    render(
      <AppBanner
        config={{
          ...DEFAULT_BANNER_SETTING,
          headline: 'Hidden banner',
        }}
      />,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('should call onDismiss when the dismiss button is clicked', async () => {
    const user = userEvent.setup({ delay: null })
    const onDismiss = vi.fn()

    render(
      <AppBanner
        config={{
          ...DEFAULT_BANNER_SETTING,
          mode: 'on',
          headline: 'Dismiss me',
        }}
        dismissible
        onDismiss={onDismiss}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))

    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('should hide the icon badge when show_icon is false', () => {
    render(
      <AppBanner
        config={{
          ...DEFAULT_BANNER_SETTING,
          mode: 'on',
          headline: 'No icon banner',
          show_icon: false,
        }}
      />,
    )

    expect(screen.getByRole('status')).not.toContainHTML('lucide-megaphone')
  })

  it('should render in preview mode when the banner is off', () => {
    render(
      <AppBanner
        preview
        config={{
          ...DEFAULT_BANNER_SETTING,
          headline: 'Preview while off',
        }}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Preview while off')
  })

  it('should not render dismiss chrome in preview mode', () => {
    render(
      <AppBanner
        preview
        config={{
          ...DEFAULT_BANNER_SETTING,
          mode: 'on',
          headline: 'Preview banner',
        }}
        dismissible
        onDismiss={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Dismiss banner' }),
    ).not.toBeInTheDocument()
  })
})
