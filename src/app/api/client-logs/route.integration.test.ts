/**
 * @vitest-environment node
 */
import { NextRequest } from 'next/server'

import { POST } from './route'

const mockAppLogError = vi.fn()
const mockAppLogInfo = vi.fn()
const mockGetUser = vi.fn()

vi.mock('@/utils/app-logger', () => ({
  appLog: {
    debug: vi.fn(),
    info: (...args: unknown[]) => mockAppLogInfo(...args),
    warn: vi.fn(),
    error: (...args: unknown[]) => mockAppLogError(...args),
  },
}))

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

const createRequest = (
  body: unknown,
  headers: Record<string, string> = {
    origin: 'http://localhost:3000',
    'content-type': 'application/json',
  },
) =>
  new NextRequest('http://localhost:3000/api/client-logs', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

describe('POST /api/client-logs', () => {
  beforeEach(() => {
    mockAppLogError.mockReset()
    mockAppLogInfo.mockReset()
    mockGetUser.mockReset()
    mockGetUser.mockResolvedValue({ data: { user: null } })
  })

  it('should forward a valid same-origin payload to appLog', async () => {
    const response = await POST(
      createRequest({
        key: 'auth-form-error',
        level: 'error',
        message: 'Supabase auth error',
        context: { supabaseCode: 'otp_expired', email: 'user@example.com' },
      }),
    )

    expect(response.status).toBe(202)
    expect(await response.json()).toEqual({ success: true })
    expect(mockAppLogError).toHaveBeenCalledWith(
      'client-auth-form-error',
      'Supabase auth error',
      { supabaseCode: 'otp_expired', email: 'user@example.com' },
    )
  })

  it('should attach userId when a session is present', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })

    await POST(
      createRequest({
        key: 'avatar-storage',
        level: 'error',
        message: 'Upload failed',
        context: { name: 'Error', message: 'fail' },
      }),
    )

    expect(mockAppLogError).toHaveBeenCalledWith(
      'client-avatar-storage',
      'Upload failed',
      expect.objectContaining({ userId: 'user-123' }),
    )
  })

  it('should reject unknown keys', async () => {
    const response = await POST(
      createRequest({
        key: 'not-a-real-key',
        level: 'error',
        message: 'nope',
      }),
    )

    expect(response.status).toBe(400)
    expect(mockAppLogError).not.toHaveBeenCalled()
  })

  it('should reject cross-origin requests', async () => {
    const response = await POST(
      createRequest(
        {
          key: 'app-error',
          level: 'error',
          message: 'Route error',
        },
        { origin: 'https://evil.example' },
      ),
    )

    expect(response.status).toBe(403)
    expect(mockAppLogError).not.toHaveBeenCalled()
  })

  it('should reject requests with no Origin or Referer', async () => {
    const response = await POST(
      createRequest(
        {
          key: 'app-error',
          level: 'error',
          message: 'Route error',
        },
        {},
      ),
    )

    expect(response.status).toBe(403)
    expect(mockAppLogError).not.toHaveBeenCalled()
  })

  it('should truncate overlong messages before forwarding', async () => {
    const message = 'm'.repeat(2_500)

    await POST(
      createRequest({
        key: 'app-error',
        level: 'error',
        message,
      }),
    )

    expect(mockAppLogError).toHaveBeenCalledWith(
      'client-app-error',
      'm'.repeat(2_000),
      null,
    )
  })

  it('should truncate over-cap context and record truncation', async () => {
    const large = 'x'.repeat(8_000)

    await POST(
      createRequest({
        key: 'app-error',
        level: 'error',
        message: 'Route error',
        context: { alpha: 'keep', bravo: large, charlie: large },
      }),
    )

    expect(mockAppLogError).toHaveBeenCalledWith(
      'client-app-error',
      'Route error',
      expect.objectContaining({
        alpha: 'keep',
        contextTruncated: true,
      }),
    )
  })
})
