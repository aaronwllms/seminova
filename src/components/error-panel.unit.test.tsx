import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { buildErrorCopyText, ErrorPanel } from './error-panel'

describe('buildErrorCopyText', () => {
  it('should format message with code when code is provided', () => {
    expect(
      buildErrorCopyText({
        message: 'Something went wrong',
        code: 'INTERNAL_ERROR',
      }),
    ).toBe('Something went wrong\nCode: INTERNAL_ERROR')
  })

  it('should return message only when code is absent', () => {
    expect(buildErrorCopyText({ message: 'Something went wrong' })).toBe(
      'Something went wrong',
    )
  })
})

describe('ErrorPanel', () => {
  it('should render message and copy button', () => {
    render(
      <ErrorPanel
        message="Something went wrong loading users."
        code="INTERNAL_ERROR"
      />,
    )

    expect(
      screen.getByText('Something went wrong loading users.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /copy error details/i }),
    ).toBeInTheDocument()
  })

  it('should show Copied feedback after clicking copy', async () => {
    const user = userEvent.setup()

    render(
      <ErrorPanel
        message="Something went wrong loading users."
        code="INTERNAL_ERROR"
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /copy error details/i }),
    )

    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeInTheDocument()
    })
  })
})
