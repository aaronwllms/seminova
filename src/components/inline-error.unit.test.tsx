import { render, screen } from '@/test/test-utils'
import { describe, expect, it } from 'vitest'

import { InlineError } from './inline-error'

describe('InlineError', () => {
  it('should render message with alert role', () => {
    render(<InlineError message="Invalid login credentials" />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Invalid login credentials',
    )
  })

  it('should not render a copy button', () => {
    render(<InlineError message="Passwords do not match" />)

    expect(
      screen.queryByRole('button', { name: /copy error details/i }),
    ).not.toBeInTheDocument()
  })
})
