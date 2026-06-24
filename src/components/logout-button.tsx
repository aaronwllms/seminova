'use client'

import { Button } from '@/components/ui/button'
import { useSignOut } from '@/hooks/use-sign-out'

export function LogoutButton() {
  const logout = useSignOut()

  return <Button onClick={logout}>Logout</Button>
}
