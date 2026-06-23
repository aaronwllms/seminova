import { NextRequest } from 'next/server'
import { GET } from './route'

const mockVerifyOtp = vi.fn()
const redirectMock = vi.fn()

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      verifyOtp: mockVerifyOtp,
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
    redirectMock.mockReset()
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
