import { describe, expect, it } from 'vitest'
import { render, screen } from '@/test/test-utils'

import { AppSettingsPanel } from './app-settings-panel'

describe('AppSettingsPanel', () => {
  it('should render registry settings grouped under Logging with current values', () => {
    render(
      <AppSettingsPanel
        initialSettings={{
          min_log_level: 'info',
          log_retention_days: 30,
        }}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Logging', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText('min_log_level')).toBeInTheDocument()
    expect(screen.getByText('log_retention_days')).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Minimum log level' }),
    ).toHaveTextContent('info')
    expect(
      screen.getByRole('spinbutton', { name: 'Log retention window' }),
    ).toHaveValue(30)
  })
})
