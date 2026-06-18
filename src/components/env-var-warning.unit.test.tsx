import { render, screen } from '@/test/test-utils'
import { EnvVarWarning } from './env-var-warning'

describe('EnvVarWarning', () => {
  it('should show warning badge and disabled auth actions', () => {
    render(<EnvVarWarning />)

    expect(
      screen.getByText(/supabase environment variables required/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled()
  })
})
