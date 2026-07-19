import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CLIENT_LOGS_RELAY_PATH } from '@/constants/app-paths'

const fetchMock = vi.fn()

describe('clientLog', () => {
  beforeEach(() => {
    vi.resetModules()
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  it('should mirror to console immediately with client tag', async () => {
    const { clientLog } = await import('./client-logger')

    clientLog.error('app-error', 'Route error', { digest: 'abc123' })

    expect(console.error).toHaveBeenCalledWith(
      '[client-app-error] Route error',
      {
        digest: 'abc123',
      },
    )
  })

  it('should flatten Error context before mirror and relay', async () => {
    const { clientLog } = await import('./client-logger')
    const error = new Error('Upload failed')

    clientLog.error('avatar-storage', 'Upload failed', error)

    expect(console.error).toHaveBeenCalledWith(
      '[client-avatar-storage] Upload failed',
      {
        name: 'Error',
        message: 'Upload failed',
        stack: error.stack,
      },
    )
    expect(fetchMock).toHaveBeenCalledWith(
      CLIENT_LOGS_RELAY_PATH,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          key: 'avatar-storage',
          level: 'error',
          message: 'Upload failed',
          context: {
            name: 'Error',
            message: 'Upload failed',
            stack: error.stack,
          },
        }),
      }),
    )
  })

  it('should preserve digest when flattening route errors', async () => {
    const { clientLog } = await import('./client-logger')
    const error = Object.assign(new Error('Boundary failure'), {
      digest: 'digest-1',
    })

    clientLog.error('auth-error', 'Route error', error)

    expect(console.error).toHaveBeenCalledWith(
      '[client-auth-error] Route error',
      {
        name: 'Error',
        message: 'Boundary failure',
        stack: error.stack,
        digest: 'digest-1',
      },
    )
  })

  it('should fire-and-forget relay without awaiting', async () => {
    const { clientLog } = await import('./client-logger')

    const result = clientLog.info('auth-form-error', 'Supabase auth error', {
      supabaseCode: 'otp_expired',
    })

    expect(result).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('should swallow relay failures', async () => {
    fetchMock.mockRejectedValue(new Error('network down'))
    const { clientLog } = await import('./client-logger')

    expect(() =>
      clientLog.warn(
        'avatar-storage',
        'Session user does not match upload target',
      ),
    ).not.toThrow()

    await Promise.resolve()
  })
})
