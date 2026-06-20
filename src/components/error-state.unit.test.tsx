import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { buildErrorCopyText, ErrorState } from './error-state'

describe('buildErrorCopyText', () => {
  it('should format message and code with optional detail', () => {
    expect(
      buildErrorCopyText({
        message: 'Something went wrong',
        code: 'INTERNAL_ERROR',
        detail: 'timeout',
      }),
    ).toBe('Something went wrong\nCode: INTERNAL_ERROR\nDetail: timeout')
  })
})

describe('ErrorState', () => {
  it('should render message and copy button when code is provided', async () => {
    const user = userEvent.setup()

    render(
      <ErrorState
        message="Something went wrong loading users."
        code="INTERNAL_ERROR"
      />,
    )

    expect(
      screen.getByText('Something went wrong loading users.'),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /copy error details/i }),
    )

    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeInTheDocument()
    })
  })

  it('should render plain destructive text without a copy button when code is absent', () => {
    render(<ErrorState message="Passwords do not match" />)

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /copy error details/i }),
    ).not.toBeInTheDocument()
  })

  it('should stay on the plain text path when detail is provided without code', () => {
    render(
      <ErrorState message="Validation failed" detail="field-level context" />,
    )

    expect(screen.getByText('Validation failed')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /copy error details/i }),
    ).not.toBeInTheDocument()
  })
})
