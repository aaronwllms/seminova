import { render, screen } from '@/test/test-utils'

import { SeminovaLogo } from './seminova-logo'

describe('SeminovaLogo', () => {
  it('should render the Seminova wordmark', () => {
    render(<SeminovaLogo href={undefined} />)

    expect(screen.getByText('Seminova')).toBeInTheDocument()
  })
})
