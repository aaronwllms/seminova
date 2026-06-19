import { siteConfig } from '@/config/site'
import { render, screen } from '@/test/test-utils'

import { SeminovaLogo } from './seminova-logo'

describe('SeminovaLogo', () => {
  it('should render the site wordmark from site config', () => {
    render(<SeminovaLogo href={undefined} />)

    expect(screen.getByText(siteConfig.name)).toBeInTheDocument()
  })
})
