'use client'

import { useCallback, useState } from 'react'

export const useCopyToClipboard = (copyText: string) => {
  const [didCopy, setDidCopy] = useState(false)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setDidCopy(true)
      window.setTimeout(() => setDidCopy(false), 2000)
    } catch {
      setDidCopy(false)
    }
  }, [copyText])

  return { didCopy, copy }
}
