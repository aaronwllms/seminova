import { describe, expect, it } from 'vitest'

import {
  AUTH_ERROR_GENERIC_MESSAGE,
  getAuthErrorMessage,
} from './auth-error-messages'

describe('getAuthErrorMessage', () => {
  it('should return confirm copy for confirm source', () => {
    expect(getAuthErrorMessage('confirm')).toContain("couldn't verify")
  })

  it('should return invalid link copy for invalid_link source', () => {
    expect(getAuthErrorMessage('invalid_link')).toContain("isn't valid")
  })

  it('should return generic copy for unknown or missing source', () => {
    expect(getAuthErrorMessage(undefined)).toBe(AUTH_ERROR_GENERIC_MESSAGE)
    expect(getAuthErrorMessage('crafted')).toBe(AUTH_ERROR_GENERIC_MESSAGE)
    expect(getAuthErrorMessage('anything')).toBe(AUTH_ERROR_GENERIC_MESSAGE)
  })
})
