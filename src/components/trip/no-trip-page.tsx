import { ReactNode, useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { useGetTrips } from '@/api/generated/trips/trips'
import { MobileHeader } from '@/components/layout/mobile-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { hasStatus } from '@/lib/api-response'

interface NoTripPageProps {
  title: string
  subtitle: string
  emptyTitle: string
  emptyDescription: string
  icon: ReactNode
  resolveTripRoute: (tripId: string) => string
}

export function NoTripPage({
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  icon,
  resolveTripRoute,
}: NoTripPageProps) {
  const { data: tripsResponse, isPending } = useGetTrips()
  const trips = hasStatus(tripsResponse, 200) ? tripsResponse.data : []
  const latestTripId = useMemo(() => {
    const latestTrip = trips
      .slice()
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime() || new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]

    return latestTrip?.id
  }, [trips])

  if (latestTripId) {
    return <Navigate to={resolveTripRoute(latestTripId)} replace />
  }

  if (isPending) {
    return null
  }

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title={title} backTo="/" />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(240,247,246,0.92))] shadow-float">
        <CardContent className="space-y-3 pt-5">
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <h2 className="text-2xl font-semibold text-foreground">先建立一趟旅程，這裡才會開始有內容。</h2>
        </CardContent>
      </Card>

      <EmptyState
        icon={icon}
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Link to="/trip/new" className="inline-flex">
            <Button>建立旅程</Button>
          </Link>
        }
      />
    </div>
  )
}
