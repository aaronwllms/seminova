import { describe, expect, it } from 'vitest'

import {
  CLIENT_LOG_CONTEXT_MAX_BYTES,
  CLIENT_LOG_MESSAGE_MAX_LENGTH,
  truncateClientLogContext,
  truncateClientLogMessage,
} from '@/app/api/client-logs/_lib/cap-client-log-payload'

describe('truncateClientLogMessage', () => {
  it('should leave short messages unchanged', () => {
    expect(truncateClientLogMessage('hello')).toBe('hello')
  })

  it('should truncate messages over the cap', () => {
    const message = 'x'.repeat(CLIENT_LOG_MESSAGE_MAX_LENGTH + 10)

    expect(truncateClientLogMessage(message)).toHaveLength(
      CLIENT_LOG_MESSAGE_MAX_LENGTH,
    )
  })
})

describe('truncateClientLogContext', () => {
  it('should leave small context unchanged', () => {
    expect(
      truncateClientLogContext({ digest: 'abc', email: 'a@b.com' }),
    ).toEqual({
      digest: 'abc',
      email: 'a@b.com',
    })
  })

  it('should drop keys deterministically and mark truncation', () => {
    const largeValue = 'x'.repeat(CLIENT_LOG_CONTEXT_MAX_BYTES)
    const context = {
      alpha: 'keep',
      bravo: largeValue,
      charlie: largeValue,
    }

    const truncated = truncateClientLogContext(context)

    expect(truncated.contextTruncated).toBe(true)
    expect(truncated.alpha).toBe('keep')
    expect(truncated.charlie).toBeUndefined()
    expect(
      Buffer.byteLength(JSON.stringify(truncated), 'utf8'),
    ).toBeLessThanOrEqual(CLIENT_LOG_CONTEXT_MAX_BYTES)
  })
})
