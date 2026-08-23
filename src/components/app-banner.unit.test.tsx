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

  it('should show an inert dismiss button in preview when dismissible', () => {
    render(
      <AppBanner
        preview
        config={{
          ...DEFAULT_BANNER_SETTING,
          mode: 'on',
          headline: 'Preview banner',
        }}
      />,
    )

    expect(document.querySelector('[aria-label="Dismiss banner"]')).toBeTruthy()
  })

  it('should hide the dismiss button in preview when persistent', () => {
    render(
      <AppBanner
        preview
        config={{
          ...DEFAULT_BANNER_SETTING,
          mode: 'on',
          headline: 'Preview banner',
          persistence: 'persistent',
        }}
      />,
    )

    expect(document.querySelector('[aria-label="Dismiss banner"]')).toBeNull()
  })

  it('should hide the dismiss button when live and persistent even if onDismiss is passed', () => {
    render(
      <AppBanner
        config={{
          ...DEFAULT_BANNER_SETTING,
          mode: 'on',
          headline: 'Must read',
          persistence: 'persistent',
        }}
        onDismiss={vi.fn()}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Must read')
    expect(document.querySelector('[aria-label="Dismiss banner"]')).toBeNull()
  })
})
