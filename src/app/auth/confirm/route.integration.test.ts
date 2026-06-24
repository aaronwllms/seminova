import { ADMIN_HOME } from '@/constants/admin-paths'
import { ADMIN_ROLE } from '@/constants/admin-role'
import { APP_HOME } from '@/constants/app-paths'
import { NextRequest } from 'next/server'
import { GET } from './route'

const mockVerifyOtp = vi.fn()
const mockGetUser = vi.fn()
const redirectMock = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      verifyOtp: mockVerifyOtp,
      getUser: mockGetUser,
    },
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    redirectMock(url)
    throw new Error('NEXT_REDIRECT')
  },
}))

describe('GET /auth/confirm', () => {
  beforeEach(() => {
    mockVerifyOtp.mockReset()
    mockGetUser.mockReset()
    redirectMock.mockReset()
    mockGetUser.mockResolvedValue({
      data: { user: { app_metadata: {} } },
    })
  })

  it('should redirect to next on successful verification', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null })

    const request = new NextRequest(
      'http://localhost/auth/confirm?token_hash=abc&type=email&next=/profile',
    )

    await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT')

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      type: 'email',
      token_hash: 'abc',
    })
    expect(redirectMock).toHaveBeenCalledWith('/profile')
  })

  it('should reject off-origin next and fall back to post-auth path', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null })

    const request = new NextRequest(
      'http://localhost/auth/confirm?token_hash=abc&type=email&next=https://evil.com',
    )

    await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT')

    expect(redirectMock).toHaveBeenCalledWith(APP_HOME)
  })

  it('should fall back to post-auth path when next is missing', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null })

    const request = new NextRequest(
      'http://localhost/auth/confirm?token_hash=abc&type=email',
    )

    await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT')

    expect(redirectMock).toHaveBeenCalledWith(APP_HOME)
  })

  it('should fall back to admin home for admin users with unsafe next', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({
      data: { user: { app_metadata: { role: ADMIN_ROLE } } },
    })

    const request = new NextRequest(
      'http://localhost/auth/confirm?token_hash=abc&type=email&next=https://evil.com',
    )

    await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT')

    expect(redirectMock).toHaveBeenCalledWith(ADMIN_HOME)
  })

  it('should redirect to error when verification fails', async () => {
    mockVerifyOtp.mockResolvedValue({
      error: { message: 'Invalid token' },
    })

    const request = new NextRequest(
      'http://localhost/auth/confirm?token_hash=abc&type=email',
    )

    await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT')

    expect(redirectMock).toHaveBeenCalledWith('/auth/error?error=Invalid token')
  })

  it('should redirect to error when token params are missing', async () => {
    const request = new NextRequest('http://localhost/auth/confirm')

    await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT')

    expect(redirectMock).toHaveBeenCalledWith(
      '/auth/error?error=No token hash or type',
    )
    expect(mockVerifyOtp).not.toHaveBeenCalled()
  })
})
