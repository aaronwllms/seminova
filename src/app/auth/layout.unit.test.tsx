import { siteConfig } from '@/config/site'
import { render, screen } from '@/test/test-utils'

import AuthLayout from './layout'

describe('AuthLayout', () => {
  it('should render the site wordmark in a muted full-page shell', () => {
    const { container } = render(
      <AuthLayout>
        <p>Child content</p>
      </AuthLayout>,
    )

    expect(screen.getByText(siteConfig.name)).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-muted', 'min-h-svh')
  })
})
