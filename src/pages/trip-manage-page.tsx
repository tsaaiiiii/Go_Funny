import { SquarePen, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/ui/section-heading'
import { useGetTripById } from '@/api/generated/trips/trips'

export function TripManagePage() {
  const { tripId } = useParams()
  const { data: tripResponse } = useGetTripById(tripId!)
  const trip = tripResponse?.data

  if (!trip) {
    return null
  }

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title="旅程管理" backTo="/" />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(240,247,246,0.92))] shadow-float">
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">管理功能</p>
              <h2 className="text-2xl font-semibold">{trip.title}</h2>
            </div>
            <Badge tone={trip.mode === 'expense' ? 'blue' : 'green'}>
              {trip.mode === 'expense' ? '一般記帳' : '公積金'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <SectionHeading title="旅程功能" />

      <div className="space-y-3">
        <Link to={`/trip/${trip.id}/edit`} className="block">
          <Card>
            <CardContent className="flex items-center gap-4 pt-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF7F8] text-primary">
                <SquarePen className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">編輯旅程</p>
                <p className="text-sm text-muted-foreground">修改名稱、地點、日期與模式。</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={`/trip/${trip.id}/members`} className="block">
          <Card>
            <CardContent className="flex items-center gap-4 pt-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F8F4] text-secondary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">管理成員</p>
                <p className="text-sm text-muted-foreground">邀請旅伴加入，或移除成員。</p>
              </div>
            </CardContent>
          </Card>
        </Link>

      </div>
    </div>
  )
}
