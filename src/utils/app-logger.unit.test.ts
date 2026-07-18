import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.unmock('@/utils/app-logger')

const afterMock = vi.fn()
const getAppSettingMock = vi.fn()
const persistAppLogRowMock = vi.fn()

vi.mock('next/server', () => ({
  after: (callback: () => void | Promise<void>) => afterMock(callback),
}))

vi.mock('@/utils/app-settings', () => ({
  getAppSetting: (key: string) => getAppSettingMock(key),
}))

vi.mock('@/utils/persist-app-log', () => ({
  normalizeLogContext: (context?: unknown) =>
    context === undefined ? null : context,
  persistAppLogRow: (input: unknown) => persistAppLogRowMock(input),
}))

describe('app-logger', () => {
  beforeEach(() => {
    vi.resetModules()
    afterMock.mockReset()
    getAppSettingMock.mockReset()
    persistAppLogRowMock.mockReset()

    getAppSettingMock.mockResolvedValue('info')
    persistAppLogRowMock.mockResolvedValue(undefined)

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  const runAfterCallback = async (index: number) => {
    const callback = afterMock.mock.calls[index]?.[0]
    expect(callback).toBeTypeOf('function')
    await callback()
  }

  it('should skip console and persist when below threshold', async () => {
    getAppSettingMock.mockResolvedValue('warn')
    const { appLog } = await import('./app-logger')

    appLog.info('auth-login', 'Sign-in succeeded')

    await runAfterCallback(0)

    expect(console.log).not.toHaveBeenCalled()
    expect(persistAppLogRowMock).not.toHaveBeenCalled()
  })

  it('should mirror to console and persist at or above threshold', async () => {
    getAppSettingMock.mockResolvedValue('info')
    const { appLog } = await import('./app-logger')

    appLog.warn('promote-admin', 'Role changed', { userId: '1' })

    await runAfterCallback(0)

    expect(console.warn).toHaveBeenCalledWith('[promote-admin] Role changed', {
      userId: '1',
    })
    expect(persistAppLogRowMock).toHaveBeenCalledWith({
      level: 'warn',
      tag: 'promote-admin',
      message: 'Role changed',
      context: { userId: '1' },
    })
  })

  it('should reflect threshold changes on subsequent after callbacks', async () => {
    getAppSettingMock
      .mockResolvedValueOnce('error')
      .mockResolvedValueOnce('debug')
    const { appLog } = await import('./app-logger')

    appLog.info('auth-login', 'first')
    await runAfterCallback(0)
    expect(persistAppLogRowMock).not.toHaveBeenCalled()

    appLog.info('auth-login', 'second')
    await runAfterCallback(1)
    expect(persistAppLogRowMock).toHaveBeenCalledOnce()
  })

  it('should register after without requiring callers to await', async () => {
    const { appLog } = await import('./app-logger')

    const result = appLog.error('api-posts', 'Unexpected error')

    expect(result).toBeUndefined()
    expect(afterMock).toHaveBeenCalledOnce()
  })
})
