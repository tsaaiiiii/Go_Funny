import { ArrowRight } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { SectionHeading } from '@/components/ui/section-heading'
import { useGetTripById } from '@/api/generated/trips/trips'
import { useGetTripSettlement } from '@/api/generated/settlements/settlements'
import { hasStatus } from '@/lib/api-response'
import { formatCurrency } from '@/lib/currency'

export function SettlementPage() {
  const { tripId } = useParams()
  const { data: tripResponse, isPending: tripPending } = useGetTripById(tripId!)
  const { data: settlementResponse, isPending: settlementPending } = useGetTripSettlement(tripId!)
  const trip = hasStatus(tripResponse, 200) ? tripResponse.data : null
  const settlement = hasStatus(settlementResponse, 200) ? settlementResponse.data : null

  if (tripPending || settlementPending) {
    return <LoadingState title="結算資料載入中" description="正在整理這趟旅程的結算結果。" />
  }

  if (!trip || !settlement) {
    return null
  }

  const totalExpense = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalContribution = trip.contributions.reduce((sum, contribution) => sum + contribution.amount, 0)
  const poolRemaining = totalContribution - totalExpense
  const poolShortage = Math.max(0, -poolRemaining)
  const summaryTitle =
    trip.mode === 'pool'
      ? poolShortage > 0
        ? `共同池尚差 ${formatCurrency(poolShortage)}`
        : `共同池剩餘 ${formatCurrency(poolRemaining)}`
      : `${settlement.transfers.length} 筆轉帳就能結清`
  const summarySubtitle = trip.mode === 'pool' ? '本次旅程共同池狀態' : '本次旅程建議結算'

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader
        title="結算結果"
        subtitle={trip.title}
        location={trip.location ?? undefined}
        backTo="/"
      />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(95,168,184,0.12),rgba(127,167,138,0.12))] shadow-float">
        <CardContent className="space-y-4 pt-5">
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">{summarySubtitle}</p>
            <h2 className="text-3xl font-semibold tracking-tight">{summaryTitle}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-white/75 p-3">
              <p className="text-muted-foreground">總支出</p>
              <p className="mt-1 font-semibold">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="rounded-2xl bg-white/75 p-3">
              <p className="text-muted-foreground">成員</p>
              <p className="mt-1 font-semibold">{trip.memberships.length} 人</p>
            </div>
            <div className="rounded-2xl bg-white/75 p-3">
              <p className="text-muted-foreground">模式</p>
              <p className="mt-1 font-semibold">{trip.mode === 'expense' ? '一般' : '公積金'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
        <CardTitle>誰欠誰</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trip.mode === 'pool' && poolShortage > 0 ? (
            <div className="rounded-2xl bg-[#FFF6EF] px-4 py-4 text-sm text-[#9A5A2E]">
              目前共同池不足 {formatCurrency(poolShortage)}，需要先補足共同池再完成結算。
            </div>
          ) : null}

          {settlement.transfers.length === 0 ? (
            <div className="rounded-2xl bg-[#F5FAF6] px-4 py-5 text-center text-sm text-muted-foreground">
              {trip.mode === 'pool'
                ? poolShortage > 0
                  ? '目前沒有可互相轉帳的對象，請先補足共同池。'
                  : '目前共同池充足，暫時不需要額外轉帳。'
                : '目前沒有需要額外轉帳的對象。'}
            </div>
          ) : (
            settlement.transfers.map((transfer) => {
              const from = trip.memberships.find((item) => item.id === transfer.from)
              const to = trip.memberships.find((item) => item.id === transfer.to)

              return (
                <div key={`${transfer.from}-${transfer.to}`} className="flex items-center justify-between rounded-2xl bg-[#FAFCFC] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D5E9EF] text-sm font-semibold">
                      {from?.user.name.charAt(0).toUpperCase()}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCEAD9] text-sm font-semibold">
                      {to?.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{from?.user.name} → {to?.user.name}</p>
                      <p className="text-xs text-muted-foreground">建議一次轉清</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(transfer.amount)}</p>
                    <p className="text-xs text-muted-foreground">轉帳金額</p>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

    </div>
  )
}
