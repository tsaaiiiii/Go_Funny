import { PropsWithChildren, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { BottomNav } from '@/components/layout/bottom-nav'

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation()
  const hideBottomNav = location.pathname.startsWith('/auth') || location.pathname.startsWith('/invitations/')
  const isTripDetailPage = /^\/trip\/[^/]+$/.test(location.pathname)

  useEffect(() => {
    if (isTripDetailPage) {
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [isTripDetailPage, location.pathname])

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-24 pt-5 sm:max-w-lg sm:px-5">
      <main className="space-y-4">{children}</main>
      {hideBottomNav ? null : <BottomNav />}
    </div>
  )
}
