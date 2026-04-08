import { Home, PlusCircle, ReceiptText, WalletCards } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useGetTrips } from '@/api/generated/trips/trips'
import { hasStatus } from '@/lib/api-response'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const location = useLocation()
  const { data: tripsResponse } = useGetTrips()
  const trips = hasStatus(tripsResponse, 200) ? tripsResponse.data : []
  const tripSegment = location.pathname.split('/')[2]
  const latestTripId = useMemo(() => {
    const latestTrip = trips
      .slice()
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime() || new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]

    return latestTrip?.id
  }, [trips])
  const hasMatchedTrip = Boolean(tripSegment && trips.some((trip) => trip.id === tripSegment))
  const currentTripId = hasMatchedTrip ? tripSegment : latestTripId
  const fallbackTripRoute = currentTripId ? `/trip/${currentTripId}` : '/details'
  const fallbackCreateRoute = currentTripId ? `/trip/${currentTripId}/new-expense` : '/new-record'
  const fallbackSettlementRoute = currentTripId ? `/trip/${currentTripId}/settlement` : '/settlement'
  const onTripDetailPage = location.pathname === '/details' || (currentTripId ? location.pathname === `/trip/${currentTripId}` : false)
  const onCreatePage = location.pathname === '/trip/new' || location.pathname === '/new-record' || /^\/trip\/[^/]+\/new-(expense|contribution)$/.test(location.pathname)
  const onSettlementPage = location.pathname === '/settlement' || (currentTripId ? location.pathname === `/trip/${currentTripId}/settlement` : false)
  const items = [
    { to: '/', label: '旅程', icon: Home, active: location.pathname === '/', disabled: false },
    {
      to: fallbackTripRoute,
      label: '明細',
      icon: ReceiptText,
      active: onTripDetailPage,
      disabled: false,
    },
    {
      to: fallbackCreateRoute,
      label: '新增',
      icon: PlusCircle,
      active: onCreatePage,
      disabled: false,
    },
    {
      to: fallbackSettlementRoute,
      label: '結算',
      icon: WalletCards,
      active: onSettlementPage,
      disabled: false,
    },
  ]

  return (
    <nav
      aria-label="主要頁面切換"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-20 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-full border border-white/70 bg-card/90 p-2 shadow-float backdrop-blur-xl sm:max-w-lg"
    >
      <ul className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const itemClassName = cn(
            'flex min-h-14 w-full touch-manipulation flex-col items-center justify-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium transition-colors',
            item.active ? 'bg-[#E9F3F5] text-primary' : 'text-muted-foreground',
            item.disabled ? 'cursor-not-allowed opacity-45' : 'hover:bg-[#F6FBFC]',
          )

          if (item.disabled || !item.to) {
            return (
              <li key={item.label}>
                <span aria-disabled="true" className={itemClassName}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </span>
              </li>
            )
          }

          return (
            <li key={item.label}>
              <Link to={item.to} aria-current={item.active ? 'page' : undefined} className={itemClassName}>
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
