import { PropsWithChildren, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { BottomNav } from '@/components/layout/bottom-nav'
import { cn } from '@/lib/utils'

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation()
  const showBottomNav =
    location.pathname === '/' ||
    location.pathname === '/details' ||
    location.pathname === '/new-record' ||
    location.pathname === '/settlement' ||
    /^\/trip\/[^/]+$/.test(location.pathname) ||
    /^\/trip\/[^/]+\/new-expense$/.test(location.pathname) ||
    /^\/trip\/[^/]+\/settlement$/.test(location.pathname)
  const isTripDetailPage = /^\/trip\/[^/]+$/.test(location.pathname)

  useEffect(() => {
    if (isTripDetailPage) {
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [isTripDetailPage, location.pathname])

  return (
    <div
      className={cn(
        'mx-auto min-h-screen w-full max-w-md px-4 pt-5 sm:max-w-lg sm:px-5',
        showBottomNav ? 'pb-[calc(env(safe-area-inset-bottom)+6.75rem)]' : 'pb-6',
      )}
    >
      <main className="space-y-4">{children}</main>
      {showBottomNav ? <BottomNav /> : null}
    </div>
  )
}
