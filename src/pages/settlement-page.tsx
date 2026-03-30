import { ArrowRight } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeading } from '@/components/ui/section-heading'
import { useAppData } from '@/lib/app-data'
import { formatCurrency } from '@/lib/currency'

export function SettlementPage() {
  const { tripId } = useParams()
  const { getTripById } = useAppData()
  const trip = getTripById(tripId)

  if (!trip) {
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
      : `${trip.settlement.transfers.length} 筆轉帳就能結清`
  const summarySubtitle = trip.mode === 'pool' ? '本次旅程共同池狀態' : '本次旅程建議結算'

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title="結算結果" backTo={`/trip/${trip.id}`} />

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
              <p className="mt-1 font-semibold">{trip.members.length} 人</p>
            </div>
            <div className="rounded-2xl bg-white/75 p-3">
              <p className="text-muted-foreground">模式</p>
              <p className="mt-1 font-semibold">{trip.mode === 'expense' ? '一般' : '公積金'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SectionHeading title="每位成員摘要" />

      <div className="space-y-3">
        {trip.members.length === 0 ? (
          <EmptyState title="還沒有成員資料" description="請先新增成員，結算頁才能正確顯示誰付了多少與誰該分攤。" />
        ) : trip.settlement.rows.map((row) => {
          const member = trip.members.find((item) => item.id === row.memberId)
          const positive = row.net >= 0

          return (
            <Card key={row.memberId}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${member?.color}`}>
                        {member?.avatar}
                      </div>
                      <div>
                        <p className="font-semibold">{member?.name}</p>
                        {trip.mode === 'pool' ? (
                          <p className="text-sm text-muted-foreground">
                            公積金存入 {formatCurrency(row.paid)} 已使用 {formatCurrency(row.share)}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">已付 {formatCurrency(row.paid)} · 應付 {formatCurrency(row.share)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {trip.mode === 'pool' ? (
                    <Badge tone={row.net >= 0 ? 'green' : 'warning'}>
                      {`剩餘 ${formatCurrency(row.net)}`}
                    </Badge>
                  ) : (
                    <Badge tone={positive ? 'green' : 'warning'}>
                      {positive ? `應收 ${formatCurrency(row.net)}` : `應付 ${formatCurrency(Math.abs(row.net))}`}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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

          {trip.settlement.transfers.length === 0 ? (
            <div className="rounded-2xl bg-[#F5FAF6] px-4 py-5 text-center text-sm text-muted-foreground">
              {trip.mode === 'pool' && poolShortage > 0
                ? '目前沒有可互相轉帳的對象，請先補足共同池。'
                : '目前共同池充足，暫時不需要額外轉帳。'}
            </div>
          ) : (
            trip.settlement.transfers.map((transfer) => {
              const from = trip.members.find((item) => item.id === transfer.fromMemberId)
              const to = trip.members.find((item) => item.id === transfer.toMemberId)

              return (
                <div key={`${transfer.fromMemberId}-${transfer.toMemberId}`} className="flex items-center justify-between rounded-2xl bg-[#FAFCFC] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${from?.color}`}>
                      {from?.avatar}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${to?.color}`}>
                      {to?.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{from?.name} → {to?.name}</p>
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
