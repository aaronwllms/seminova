'use client'

import { useEffect, useState } from 'react'

export const useMounted = (): boolean => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard so the first client paint matches SSR
    setMounted(true)
  }, [])

  return mounted
}
