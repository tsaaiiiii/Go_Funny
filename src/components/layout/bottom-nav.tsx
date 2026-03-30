import { Home, PlusCircle, ReceiptText, WalletCards } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAppData } from '@/lib/app-data'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const location = useLocation()
  const { trips } = useAppData()
  const tripSegment = location.pathname.split('/')[2]
  const latestTripId = useMemo(() => {
    const latestTrip = trips
      .slice()
      .sort((a, b) => b.endDate.localeCompare(a.endDate) || b.startDate.localeCompare(a.startDate))[0]

    return latestTrip?.id
  }, [trips])
  const hasMatchedTrip = Boolean(tripSegment && trips.some((trip) => trip.id === tripSegment))
  const currentTripId = hasMatchedTrip ? tripSegment : latestTripId
  const items = [
    { to: '/', label: '旅程', icon: Home, active: location.pathname === '/' || location.pathname === '/trip/new' },
    {
      to: currentTripId ? `/trip/${currentTripId}` : '/',
      label: '明細',
      icon: ReceiptText,
      active:
        location.pathname.startsWith(`/trip/${currentTripId}`) &&
        !location.pathname.includes('new-expense') &&
        !location.pathname.includes('new-contribution') &&
        !location.pathname.includes('settlement'),
    },
    {
      to: currentTripId ? `/trip/${currentTripId}/new-expense` : '/',
      label: '新增',
      icon: PlusCircle,
      active: location.pathname.includes('/new-expense') || location.pathname.includes('/new-contribution'),
    },
    {
      to: currentTripId ? `/trip/${currentTripId}/settlement` : '/',
      label: '結算',
      icon: WalletCards,
      active: location.pathname.includes('/settlement'),
    },
  ]

  return (
    <nav className="fixed bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-full border border-white/70 bg-card/90 p-2 shadow-float backdrop-blur-xl sm:max-w-lg">
      <ul className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium transition-colors',
                  item.active ? 'bg-[#E9F3F5] text-primary' : 'text-muted-foreground',
                )}
              >
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
