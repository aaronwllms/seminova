import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.unmock('@/utils/persist-app-log')

const insertMock = vi.fn()
const createServiceClientMock = vi.fn()

vi.mock('@/supabase/service', () => ({
  createServiceClient: () => createServiceClientMock(),
}))

describe('persist-app-log', () => {
  beforeEach(() => {
    vi.resetModules()
    insertMock.mockReset()
    createServiceClientMock.mockReset()

    const fromMock = vi.fn(() => ({
      insert: insertMock,
    }))

    createServiceClientMock.mockReturnValue({
      from: fromMock,
    })
    insertMock.mockResolvedValue({ error: null })

    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should insert a normalized log row on success', async () => {
    const { persistAppLogRow } = await import('./persist-app-log')

    await persistAppLogRow({
      level: 'info',
      tag: 'test-tag',
      message: 'hello',
      context: { userId: 'abc' },
    })

    expect(createServiceClientMock).toHaveBeenCalledOnce()
    expect(insertMock).toHaveBeenCalledWith({
      level: 'info',
      tag: 'test-tag',
      message: 'hello',
      context: { userId: 'abc' },
    })
  })

  it('should normalize Error context to name, message, and stack', async () => {
    const { normalizeLogContext, persistAppLogRow } =
      await import('./persist-app-log')
    const error = new Error('boom')

    await persistAppLogRow({
      level: 'error',
      tag: 'test-tag',
      message: 'failed',
      context: normalizeLogContext(error),
    })

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        context: {
          name: 'Error',
          message: 'boom',
          stack: error.stack,
        },
      }),
    )
  })

  it('should wrap array context in a value object', async () => {
    const { normalizeLogContext } = await import('./persist-app-log')

    expect(normalizeLogContext(['a', 'b'])).toEqual({ value: ['a', 'b'] })
  })

  it('should wrap primitive context in a value object', async () => {
    const { normalizeLogContext } = await import('./persist-app-log')

    expect(normalizeLogContext('plain-string')).toEqual({
      value: 'plain-string',
    })
  })

  it('should substitute unserializable context with a string fallback', async () => {
    const { normalizeLogContext, persistAppLogRow } =
      await import('./persist-app-log')
    const circular: Record<string, unknown> = {}
    circular.self = circular

    await persistAppLogRow({
      level: 'warn',
      tag: 'test-tag',
      message: 'weird context',
      context: normalizeLogContext(circular),
    })

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        context: { unserializable: '[object Object]' },
      }),
    )
  })

  it('should swallow insert failures without rethrowing', async () => {
    insertMock.mockResolvedValue({
      error: { message: 'insert failed' },
    })

    const { persistAppLogRow } = await import('./persist-app-log')

    await expect(
      persistAppLogRow({
        level: 'error',
        tag: 'test-tag',
        message: 'failed',
        context: null,
      }),
    ).resolves.toBeUndefined()

    expect(console.error).toHaveBeenCalledWith(
      '[persist-app-log] Failed to insert log row',
      expect.objectContaining({ message: 'insert failed' }),
    )
  })
})
