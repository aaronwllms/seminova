/**
 * @vitest-environment node
 */
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { isSameOriginRelayRequest } from './is-same-origin-relay-request'

const createRequest = (headers: Record<string, string>) =>
  new NextRequest('http://localhost:3000/api/client-logs', {
    method: 'POST',
    headers,
  })

describe('isSameOriginRelayRequest', () => {
  it('should deny requests with a malformed Origin header', () => {
    expect(
      isSameOriginRelayRequest(createRequest({ origin: 'not-a-valid-url' })),
    ).toBe(false)
  })

  it('should allow same-site requests that only send Referer', () => {
    expect(
      isSameOriginRelayRequest(
        createRequest({ referer: 'http://localhost:3000/admin/logs' }),
      ),
    ).toBe(true)
  })

  it('should deny requests when Referer origin does not match the site', () => {
    expect(
      isSameOriginRelayRequest(
        createRequest({ referer: 'https://evil.example/phish' }),
      ),
    ).toBe(false)
  })
})
