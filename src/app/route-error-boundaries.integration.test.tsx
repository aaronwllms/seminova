import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LOGIN_PATH, PROFILE_PATH } from '@/constants/app-paths'

import AppError from './(app)/error'
import AdminError from './admin/error'
import AuthError from './auth/error'

const boundaryCases = [
  {
    segment: 'app',
    ErrorBoundary: AppError,
    panelMessage: 'This page could not be loaded',
    escapeLinkName: /sign in/i,
    escapeHref: LOGIN_PATH,
  },
  {
    segment: 'admin',
    ErrorBoundary: AdminError,
    panelMessage: 'The admin console could not be loaded',
    escapeLinkName: /back to profile/i,
    escapeHref: PROFILE_PATH,
  },
  {
    segment: 'auth',
    ErrorBoundary: AuthError,
    panelMessage: 'This sign-in page could not be loaded',
    escapeLinkName: /^home$/i,
    escapeHref: '/',
  },
] as const

describe('route error boundaries', () => {
  it.each(boundaryCases)(
    'should render fault UI for $segment segment',
    async ({ ErrorBoundary, panelMessage, escapeLinkName, escapeHref }) => {
      const reset = vi.fn()
      const user = userEvent.setup({ delay: null })

      render(<ErrorBoundary error={new Error('test fault')} reset={reset} />)

      expect(
        screen.getByRole('heading', { name: /something went wrong/i }),
      ).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(panelMessage)
      expect(
        screen.getByRole('button', { name: /copy error details/i }),
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /try again/i }))
      expect(reset).toHaveBeenCalledOnce()

      expect(
        screen.getByRole('link', { name: escapeLinkName }),
      ).toHaveAttribute('href', escapeHref)
    },
  )
})
