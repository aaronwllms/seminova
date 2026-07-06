import { siteConfig } from '@/config/site'
import { render, screen } from '@/test/test-utils'

import AuthLayout from './layout'

describe('AuthLayout', () => {
  it('should render the site wordmark linking home and child content', () => {
    render(
      <AuthLayout>
        <p>Child content</p>
      </AuthLayout>,
    )

    expect(screen.getByText(siteConfig.name)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: siteConfig.name })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })
})
