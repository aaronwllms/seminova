import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { ErrorPanel } from './error-panel'

describe('ErrorPanel', () => {
  it('should render title, description, visible code chip, and labeled copy button', () => {
    render(
      <ErrorPanel
        title="Something went wrong"
        message="Something went wrong loading users."
        code="INTERNAL_ERROR"
      />,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText('Something went wrong loading users.'),
    ).toBeInTheDocument()
    expect(screen.getByText('INTERNAL_ERROR')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument()
  })

  it('should render description without title when title is omitted', () => {
    render(
      <ErrorPanel
        message="This page could not be loaded. Try again or sign in."
        digest="a91c4e"
      />,
    )

    expect(
      screen.getByText('This page could not be loaded. Try again or sign in.'),
    ).toBeInTheDocument()
    expect(screen.getByText('a91c4e')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /something went wrong/i }),
    ).not.toBeInTheDocument()
  })

  it('should swap the copy button to a Copied state after clicking', async () => {
    const user = userEvent.setup({ delay: null })

    render(
      <ErrorPanel
        message="Something went wrong loading users."
        code="INTERNAL_ERROR"
      />,
    )

    await user.click(screen.getByRole('button', { name: /^copy$/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^copied$/i }),
      ).toBeInTheDocument()
    })
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard')
  })
})
