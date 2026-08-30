'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { TRANSIENT_SUCCESS_MS } from '@/constants/transient-feedback'

export const useCopyToClipboard = (copyText: string) => {
  const [didCopy, setDidCopy] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current)
      }
      setDidCopy(true)
      resetTimerRef.current = setTimeout(() => {
        setDidCopy(false)
        resetTimerRef.current = null
      }, TRANSIENT_SUCCESS_MS)
    } catch {
      setDidCopy(false)
    }
  }, [copyText])

  return { didCopy, copy }
}
