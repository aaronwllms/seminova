import * as React from 'react'

const MOBILE_BREAKPOINT = 768

const getIsMobile = () => window.innerWidth < MOBILE_BREAKPOINT

export const useIsMobile = () => {
  // Always false on server and first client paint so SSR markup matches hydration.
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(getIsMobile())
    }

    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
