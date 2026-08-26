import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { render, screen, waitFor } from '@/test/test-utils'

import { UserAvatar } from './user-avatar'

const avatarUrl = 'https://example.com/avatar.webp'

let originalSrcDescriptor: PropertyDescriptor | undefined

function installImageLoadSimulation() {
  originalSrcDescriptor = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    'src',
  )

  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true,
    get() {
      return originalSrcDescriptor?.get?.call(this) as string
    },
    set(value: string) {
      originalSrcDescriptor?.set?.call(this, value)
      queueMicrotask(() => {
        Object.defineProperty(this, 'complete', {
          configurable: true,
          value: true,
        })
        Object.defineProperty(this, 'naturalWidth', {
          configurable: true,
          value: 1,
        })
        this.dispatchEvent(new Event('load'))
      })
    },
  })
}

function uninstallImageLoadSimulation() {
  if (originalSrcDescriptor) {
    Object.defineProperty(
      HTMLImageElement.prototype,
      'src',
      originalSrcDescriptor,
    )
  }
}

describe('UserAvatar', () => {
  it('should render profile initials from display name', () => {
    render(
      <UserAvatar
        displayName="Alice Smith"
        email="alice@example.com"
        avatarUrl={null}
      />,
    )

    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('should fall back to email initials when display name is missing', () => {
    render(
      <UserAvatar
        displayName={null}
        email="admin@example.com"
        avatarUrl={null}
      />,
    )

    expect(screen.getByText('AD')).toBeInTheDocument()
  })

  it('should omit avatar image when avatarUrl is missing', () => {
    const { container } = render(
      <UserAvatar
        displayName="Alice Smith"
        email="alice@example.com"
        avatarUrl={null}
      />,
    )

    expect(container.querySelector('[data-slot="avatar-image"]')).toBeNull()
    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  describe('when avatarUrl is present', () => {
    beforeEach(() => {
      installImageLoadSimulation()
    })

    afterEach(() => {
      uninstallImageLoadSimulation()
    })

    it('should render the avatar image after it loads', async () => {
      const { container } = render(
        <UserAvatar
          displayName="Alice Smith"
          email="alice@example.com"
          avatarUrl={avatarUrl}
        />,
      )

      await waitFor(() => {
        const image = container.querySelector('[data-slot="avatar-image"]')
        expect(image).not.toBeNull()
        expect(image).toHaveAttribute('src', avatarUrl)
      })
    })

    it('should omit avatar image for unsafe avatarUrl schemes', () => {
      const { container } = render(
        <UserAvatar
          displayName="Alice Smith"
          email="alice@example.com"
          avatarUrl="javascript:alert(1)"
        />,
      )

      expect(container.querySelector('[data-slot="avatar-image"]')).toBeNull()
      expect(screen.getByText('AS')).toBeInTheDocument()
    })

    it('should render previewSrc and prefer it over avatarUrl', async () => {
      const previewSrc = 'blob:preview.webp'

      const { container } = render(
        <UserAvatar
          displayName="Alice Smith"
          email="alice@example.com"
          avatarUrl={avatarUrl}
          previewSrc={previewSrc}
        />,
      )

      await waitFor(() => {
        const image = container.querySelector('[data-slot="avatar-image"]')
        expect(image).not.toBeNull()
        expect(image).toHaveAttribute('src', previewSrc)
      })
    })
  })
})
