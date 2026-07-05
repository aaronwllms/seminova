'use client'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const ReactQueryDevtoolsPanel = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return <ReactQueryDevtools initialIsOpen={false} />
}
