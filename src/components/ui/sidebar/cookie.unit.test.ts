import { describe, expect, it } from 'vitest'

import {
  parseSidebarOpenCookie,
  readSidebarOpenFromDocumentCookie,
} from './cookie'

describe('parseSidebarOpenCookie', () => {
  it('should return defaultOpen when cookie value is missing', () => {
    expect(parseSidebarOpenCookie(undefined)).toBe(true)
    expect(parseSidebarOpenCookie(null)).toBe(true)
    expect(parseSidebarOpenCookie('')).toBe(true)
    expect(parseSidebarOpenCookie(undefined, false)).toBe(false)
  })

  it('should parse true and false cookie values', () => {
    expect(parseSidebarOpenCookie('true')).toBe(true)
    expect(parseSidebarOpenCookie('false')).toBe(false)
  })
})

describe('readSidebarOpenFromDocumentCookie', () => {
  it('should read sidebar_state from document.cookie', () => {
    document.cookie = 'sidebar_state=false; path=/'

    expect(readSidebarOpenFromDocumentCookie()).toBe(false)
  })

  it('should fall back to defaultOpen when cookie is absent', () => {
    document.cookie = 'sidebar_state=; path=/; max-age=0'

    expect(readSidebarOpenFromDocumentCookie(false)).toBe(false)
  })
})
