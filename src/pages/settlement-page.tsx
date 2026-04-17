import { ArrowRight, AlertCircle, Coins } from 'lucide-react'
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
  const unallocatedExpenses =
    trip.mode === 'expense'
      ? trip.expenses
          .map((expense) => {
            const splitSum = expense.splits.reduce((sum, split) => sum + split.amount, 0)
            const unallocated = expense.amount - splitSum
            if (unallocated <= 0) return null
            const payer = trip.memberships.find((member) => member.id === expense.payerMembershipId)
            return {
              expenseId: expense.id,
              title: expense.title,
              amount: expense.amount,
              splitCount: expense.splits.length,
              splitType: expense.splitType,
              payerName: payer?.user.name ?? '未指定付款人',
              unallocated,
            }
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
      : []
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

      {settlement.unallocated > 0 ? (
        <Card className="overflow-hidden border-none bg-[#FFF1E2] shadow-soft">
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-[#B66A2E]">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-[#7A4422]">未分配金額</p>
                  <span className="text-2xl font-semibold tracking-tight text-[#9A5A2E]">
                    {formatCurrency(settlement.unallocated)}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#7A4422]/75">
                  這筆金額不會自動進入任何人的債務，請和旅伴討論後自行決定怎麼處理。
                </p>
              </div>
            </div>

            {trip.mode === 'expense' && unallocatedExpenses.length > 0 ? (
              <div className="space-y-2 rounded-3xl bg-white/85 p-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5A2E]/80">明細</p>
                  <span className="text-[11px] text-[#9A5A2E]/70">{unallocatedExpenses.length} 筆</span>
                </div>
                <ul className="space-y-2">
                  {unallocatedExpenses.map((item) => (
                    <li
                      key={item.expenseId}
                      className="rounded-2xl bg-[#FFFBF4] px-3 py-3 text-xs leading-5 text-[#7A4422]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5DDC2] text-[11px] font-semibold text-[#7A4422]">
                          {item.payerName.charAt(0).toUpperCase()}
                        </div>
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#5C341A]">
                          {item.title}
                        </p>
                        <span className="shrink-0 rounded-full bg-[#F5DDC2] px-2.5 py-1 text-xs font-semibold text-[#9A5A2E]">
                          +{formatCurrency(item.unallocated)}
                        </span>
                      </div>
                      <p className="mt-1.5 pl-11 text-[11px] leading-5 text-[#7A4422]/80">
                        {item.payerName} 付 {formatCurrency(item.amount)}，{item.splitCount} 人平分後剩下 {formatCurrency(item.unallocated)}。
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {trip.mode === 'pool' ? (
              <div className="flex items-start gap-2.5 rounded-2xl bg-white/85 px-3 py-3 text-xs leading-5 text-[#7A4422]">
                <Coins className="mt-0.5 h-4 w-4 shrink-0 text-[#B66A2E]" />
                <p>
                  共同池總支出 <span className="font-semibold">{formatCurrency(totalExpense)}</span> 平均給 {trip.memberships.length} 人後，因無條件捨去產生{' '}
                  <span className="font-semibold">{formatCurrency(settlement.unallocated)}</span> 差額。
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

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
