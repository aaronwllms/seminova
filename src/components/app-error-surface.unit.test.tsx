import { render, screen } from '@/test/test-utils'
import { describe, expect, it } from 'vitest'

import { AppErrorSurface } from './app-error-surface'

describe('AppErrorSurface', () => {
  it('should render operational errors inline with alert role and no copy button', () => {
    render(
      <AppErrorSurface
        error={{
          message: 'Invalid login credentials',
          kind: 'operational',
          code: 'INVALID_CREDENTIALS',
        }}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Invalid login credentials',
    )
    expect(
      screen.queryByRole('button', { name: /copy error details/i }),
    ).not.toBeInTheDocument()
  })

  it('should render fault errors in a reportable panel with copy button', () => {
    render(
      <AppErrorSurface
        error={{
          message: 'Something went wrong.',
          kind: 'fault',
          code: 'INTERNAL_ERROR',
        }}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
    expect(
      screen.getByRole('button', { name: /copy error details/i }),
    ).toBeInTheDocument()
  })

  it('should render nothing when error is null or undefined', () => {
    render(<AppErrorSurface error={null} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    render(<AppErrorSurface error={undefined} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
