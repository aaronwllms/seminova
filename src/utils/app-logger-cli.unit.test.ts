import { beforeEach, describe, expect, it, vi } from 'vitest'

const resolveAppSettingsMock = vi.fn()
const persistAppLogRowMock = vi.fn()

vi.mock('@/utils/app-settings', () => ({
  resolveAppSettings: () => resolveAppSettingsMock(),
}))

vi.mock('@/utils/persist-app-log', () => ({
  normalizeLogContext: (context?: unknown) =>
    context === undefined ? null : context,
  persistAppLogRow: (input: unknown) => persistAppLogRowMock(input),
}))

describe('app-logger-cli', () => {
  beforeEach(() => {
    vi.resetModules()
    resolveAppSettingsMock.mockReset()
    persistAppLogRowMock.mockReset()

    resolveAppSettingsMock.mockResolvedValue({ min_log_level: 'info' })
    persistAppLogRowMock.mockResolvedValue(undefined)

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('should await persist on success', async () => {
    const { cliLog } = await import('./app-logger-cli')

    await cliLog.info('promote-admin', 'user promoted')

    expect(persistAppLogRowMock).toHaveBeenCalledWith({
      level: 'info',
      tag: 'promote-admin',
      message: 'user promoted',
      context: null,
    })
    expect(console.log).toHaveBeenCalledWith('[promote-admin] user promoted')
  })

  it('should skip console and persist when below threshold', async () => {
    resolveAppSettingsMock.mockResolvedValue({ min_log_level: 'error' })
    const { cliLog } = await import('./app-logger-cli')

    await cliLog.warn('promote-admin', 'sensitive change')

    expect(console.warn).not.toHaveBeenCalled()
    expect(persistAppLogRowMock).not.toHaveBeenCalled()
  })

  it('should load threshold once from resolveAppSettings', async () => {
    const { cliLog } = await import('./app-logger-cli')

    await cliLog.info('promote-admin', 'first')
    await cliLog.info('promote-admin', 'second')

    expect(resolveAppSettingsMock).toHaveBeenCalledOnce()
  })
})
