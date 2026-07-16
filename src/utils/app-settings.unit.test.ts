import { beforeEach, describe, expect, it, vi } from 'vitest'

const selectMock = vi.fn()
const createServiceClientMock = vi.fn()

vi.mock('@/supabase/service', () => ({
  createServiceClient: () => createServiceClientMock(),
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}))

describe('app-settings', () => {
  beforeEach(() => {
    vi.resetModules()
    selectMock.mockReset()
    createServiceClientMock.mockReset()

    const fromMock = vi.fn(() => ({
      select: selectMock,
    }))

    createServiceClientMock.mockReturnValue({
      from: fromMock,
    })
    selectMock.mockResolvedValue({ data: [], error: null })
  })

  it('should return registry defaults when no rows are stored', async () => {
    const { resolveAppSettings } = await import('./app-settings')
    const settings = await resolveAppSettings()

    expect(settings).toEqual({
      min_log_level: 'info',
      log_retention_days: 30,
    })
  })

  it('should merge stored values with registry defaults', async () => {
    selectMock.mockResolvedValue({
      data: [
        { key: 'min_log_level', value: 'warn' },
        { key: 'log_retention_days', value: 14 },
      ],
      error: null,
    })

    const { resolveAppSettings } = await import('./app-settings')
    const settings = await resolveAppSettings()

    expect(settings).toEqual({
      min_log_level: 'warn',
      log_retention_days: 14,
    })
  })

  it('should support heterogeneous value types in one resolved snapshot', async () => {
    selectMock.mockResolvedValue({
      data: [{ key: 'min_log_level', value: 'debug' }],
      error: null,
    })

    const { resolveAppSettings } = await import('./app-settings')
    const settings = await resolveAppSettings()

    expect(settings.min_log_level).toBe('debug')
    expect(typeof settings.log_retention_days).toBe('number')
    expect(settings.log_retention_days).toBe(30)
  })
})
